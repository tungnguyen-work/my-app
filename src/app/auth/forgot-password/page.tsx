"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}/auth/update-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (resetError) {
      setError(`Không thể gửi email đặt lại mật khẩu: ${resetError.message}`);
      setIsSubmitting(false);
      return;
    }

    setMessage("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.");
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            Quên mật khẩu
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Đặt lại mật khẩu
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
            </button>
          </form>

          <div className="mt-5 flex justify-between text-sm">
            <Link href="/auth" className="font-medium text-blue-700 hover:text-blue-800">
              Quay lại đăng nhập
            </Link>
            <Link href="/" className="font-medium text-slate-600 hover:text-blue-700">
              Trang chủ
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
