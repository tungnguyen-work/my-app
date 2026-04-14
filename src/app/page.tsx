import Link from "next/link";

import { JobBoard } from "@/components/JobBoard";
import { getJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { jobs, error } = await getJobs();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50 font-sans">
      <header className="border-b border-blue-100/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
              Job board
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Việc làm tối giản
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25">
              {jobs.length} vị trí
            </span>
            <Link
              href="/jobs/new"
              className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-900/5 transition-colors hover:bg-blue-50"
            >
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Không tải được dữ liệu jobs từ Supabase. Chi tiết: {error}
          </div>
        </main>
      ) : (
        <JobBoard jobs={jobs} />
      )}
    </div>
  );
}
