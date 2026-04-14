"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthActions() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  if (isLoading) {
    return (
      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-400">
        ...
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-900/5 transition-colors hover:bg-blue-50"
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <details className="group relative">
        <summary className="list-none cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-900/5 transition-colors hover:bg-slate-50 sm:px-4 sm:text-sm">
          Tài khoản
        </summary>

        <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <p className="truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            {user.email}
          </p>

          <div className="mt-2 space-y-1">
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              href="/account"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Quản lý tài khoản
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
