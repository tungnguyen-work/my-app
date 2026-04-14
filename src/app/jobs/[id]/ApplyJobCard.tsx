"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ApplyJobCardProps = {
  jobId: string;
  company: string;
  type: string;
  postedAtLabel: string;
};

type ApplyFormState = {
  fullName: string;
  email: string;
};

const INITIAL_FORM: ApplyFormState = {
  fullName: "",
  email: "",
};

export default function ApplyJobCard({
  jobId,
  company,
  type,
  postedAtLabel,
}: ApplyJobCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<ApplyFormState>(INITIAL_FORM);
  const [isDone, setIsDone] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setIsAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  function openModal() {
    if (!isAuthReady) {
      return;
    }
    if (!user) {
      const next = pathname || "/";
      router.push(`/auth?next=${encodeURIComponent(next)}`);
      return;
    }
    setIsOpen(true);
    setError(null);
    setSuccess(null);
    setIsDone(false);
  }

  function closeModal() {
    setIsOpen(false);
    setIsSubmitting(false);
    setError(null);
    setSuccess(null);
    setIsDone(false);
    setSelectedFile(null);
    setForm(INITIAL_FORM);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  async function uploadPdfResume(file: File) {
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `${jobId}/${crypto.randomUUID()}-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("application-resumes")
      .upload(filePath, file, { upsert: false, contentType: "application/pdf" });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return filePath;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!selectedFile) {
      setError("Vui lòng tải lên CV dạng PDF.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Chỉ chấp nhận file PDF.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File CV cần nhỏ hơn 5MB.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resumePath = await uploadPdfResume(selectedFile);

      const payload = {
        candidate_name: fullName,
        candidate_email: email,
        resume_url: resumePath,
        job_id: jobId,
      };

      const { error: insertError } = await supabase.from("applications").insert(payload);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess("Ứng tuyển thành công");
      setIsDone(true);
      setForm(INITIAL_FORM);
      setSelectedFile(null);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đơn ứng tuyển.";
      setError(`Không thể gửi đơn: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-sm shadow-blue-900/5">
        <h2 className="text-sm font-semibold text-slate-800">Ứng tuyển nhanh</h2>
        <p className="mt-1 text-xs text-slate-500">Nộp CV chỉ trong vài bước.</p>

        <button
          type="button"
          onClick={openModal}
          disabled={!isAuthReady}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Ứng tuyển
        </button>
        {!user && (
          <p className="mt-2 text-xs text-slate-500">
            Vui lòng đăng nhập để nộp hồ sơ cho vị trí này.
          </p>
        )}

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Công ty</span>
            <span className="font-medium text-slate-800">{company}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-slate-500">Loại hình</span>
            <span className="font-medium text-slate-800">{type}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-slate-500">Ngày đăng</span>
            <span className="font-medium text-slate-800">{postedAtLabel}</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Nộp đơn ứng tuyển</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Hoàn tất thông tin để gửi CV đến nhà tuyển dụng.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {isDone ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-base font-semibold text-emerald-800">{success}</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Hồ sơ của bạn đã được ghi nhận. Nhà tuyển dụng sẽ liên hệ nếu phù hợp.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Họ tên
                </label>
                <input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                  placeholder="Nguyen Van A"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="resumeFile" className="text-sm font-medium text-slate-700">
                  CV (PDF)
                </label>
                <input
                  id="resumeFile"
                  required
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="mt-1 block w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Vui lòng tải lên CV định dạng PDF (khuyến nghị dưới 5MB).
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
                </button>
              </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
