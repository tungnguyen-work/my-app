import { Suspense } from "react";

import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
          <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
            <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
              <div className="h-6 w-44 rounded-lg bg-slate-100" />
              <div className="mt-4 h-9 w-64 rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-80 rounded-lg bg-slate-100" />
              <div className="mt-6 h-10 w-full rounded-xl bg-slate-100" />
              <div className="mt-4 h-10 w-full rounded-xl bg-slate-100" />
              <div className="mt-4 h-10 w-full rounded-xl bg-slate-100" />
            </section>
          </main>
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
