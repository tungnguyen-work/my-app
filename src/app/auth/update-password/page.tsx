"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsSessionReady(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsSessionReady(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(`Không thể cập nhật mật khẩu: ${updateError.message}`);
      setIsSubmitting(false);
      return;
    }

    setMessage("Mật khẩu đã được cập nhật. Bạn sẽ được chuyển về trang đăng nhập.");
    setTimeout(() => {
      router.push("/auth");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            Đặt lại mật khẩu
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Tạo mật khẩu mới
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {!isSessionReady ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  required
                  minLength={6}
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
                  placeholder="Nhập lại mật khẩu mới"
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
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          )}

          <div className="mt-5 flex justify-between text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-blue-700 hover:text-blue-800">
              Gửi lại email
            </Link>
            <Link href="/auth" className="font-medium text-slate-600 hover:text-blue-700">
              Về đăng nhập
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
