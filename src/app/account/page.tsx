"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;

      if (!data.user) {
        router.push("/auth?next=/account");
        return;
      }

      setEmail(data.user.email ?? "");
      setFullName((data.user.user_metadata?.full_name as string | undefined) ?? "");
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setProfileMessage(null);
    setIsSavingProfile(true);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    if (updateError) {
      setError(`Không thể cập nhật hồ sơ: ${updateError.message}`);
      setIsSavingProfile(false);
      return;
    }

    setProfileMessage("Thông tin tài khoản đã được cập nhật.");
    setIsSavingProfile(false);
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsChangingPassword(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(`Không thể đổi mật khẩu: ${updateError.message}`);
      setIsChangingPassword(false);
      return;
    }

    setPasswordMessage("Đổi mật khẩu thành công.");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="h-40 animate-pulse rounded-2xl border border-blue-100/80 bg-white" />
        </main>
      </div>
    );
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
            Tài khoản
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Quản lý tài khoản
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cập nhật thông tin cá nhân và bảo mật đăng nhập của bạn.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleUpdateProfile}>
            <h2 className="text-sm font-semibold text-slate-800">Thông tin cá nhân</h2>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                disabled
                value={email}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Họ và tên hiển thị
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
                placeholder="Nguyen Van A"
              />
            </div>

            {profileMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </form>

          <form className="mt-8 space-y-4 border-t border-blue-100/70 pt-6" onSubmit={handleChangePassword}>
            <h2 className="text-sm font-semibold text-slate-800">Đổi mật khẩu</h2>
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 focus:ring-2"
              />
            </div>

            {passwordMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
