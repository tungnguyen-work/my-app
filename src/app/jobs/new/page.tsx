"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase";

type JobFormState = {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "Full-time" | "Part-time";
  description: string;
};

const INITIAL_FORM: JobFormState = {
  title: "",
  company: "",
  location: "",
  salary: "",
  type: "Full-time",
  description: "",
};

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      salary: form.salary.trim(),
      type: form.type,
      description: form.description.trim(),
    };

    const { error: insertError } = await supabase.from("jobs").insert(payload);

    if (insertError) {
      setError(`Không thể đăng tin: ${insertError.message}`);
      setIsSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            <span aria-hidden>←</span>
            Quay lại trang chủ
          </Link>
        </div>

        <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            Tạo tin mới
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Đăng tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Điền thông tin bên dưới để hiển thị tin tuyển dụng lên trang chủ.
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
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                placeholder="VD: Frontend Developer (React)"
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                  placeholder="VD: Google"
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                  placeholder="VD: Ho Chi Minh City"
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
                  onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                  placeholder="VD: $1000 - $1500"
                />
              </div>
              <div>
                <label htmlFor="type" className="text-sm font-medium text-slate-700">
                  Loại hình
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as JobFormState["type"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700"
              >
                Mô tả chi tiết
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                placeholder="Mô tả trách nhiệm công việc, yêu cầu và quyền lợi..."
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Đang đăng..." : "Đăng tin"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

