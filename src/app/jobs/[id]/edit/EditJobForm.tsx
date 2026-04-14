"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase";

type EditJobFormProps = {
  jobId: string;
  initialData: {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: "Full-time" | "Part-time" | "Contract" | "Internship";
    description: string;
  };
};

type EditFormState = EditJobFormProps["initialData"];

export default function EditJobForm({ jobId, initialData }: EditJobFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EditFormState>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Bạn cần đăng nhập để cập nhật bài đăng.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      salary: form.salary.trim(),
      type: form.type,
      description: form.description.trim(),
    };

    const { error: updateError } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", jobId)
      .eq("user_id", user.id);

    if (updateError) {
      setError(`Không thể cập nhật bài đăng: ${updateError.message}`);
      setIsSubmitting(false);
      return;
    }

    router.push(`/jobs/${jobId}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-4">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            <span aria-hidden>←</span>
            Quay lại chi tiết công việc
          </Link>
        </div>

        <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            Quản lý bài đăng
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Chỉnh sửa tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cập nhật nội dung để ứng viên hiểu rõ hơn về vị trí tuyển dụng.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="text-sm font-medium text-slate-700">
                Tiêu đề công việc
              </label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="text-sm font-medium text-slate-700">
                  Công ty
                </label>
                <input
                  id="company"
                  required
                  value={form.company}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium text-slate-700">
                  Địa điểm
                </label>
                <input
                  id="location"
                  required
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="salary" className="text-sm font-medium text-slate-700">
                  Mức lương
                </label>
                <input
                  id="salary"
                  required
                  value={form.salary}
                  onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="type" className="text-sm font-medium text-slate-700">
                  Loại hình
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      type: event.target.value as EditFormState["type"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-slate-700">
                Mô tả chi tiết
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <Link
                href={`/jobs/${jobId}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
