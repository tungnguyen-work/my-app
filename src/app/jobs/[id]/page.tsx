import Link from "next/link";
import { notFound } from "next/navigation";

import ApplyJobCard from "./ApplyJobCard";
import { getJobById } from "@/lib/jobs";

export const dynamic = "force-dynamic";

function formatPosted(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedId = decodeURIComponent(id).trim();
  const { job, error } = await getJobById(normalizedId);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Không tải được dữ liệu công việc từ Supabase. Chi tiết: {error}
          </div>
        </main>
      </div>
    );
  }

  if (!job) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <header className="border-b border-blue-100/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
            >
              <span aria-hidden className="text-lg leading-none">
                ←
              </span>
              Quay lại
            </Link>

            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25">
              {job.type}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
              Chi tiết công việc
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {job.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="font-medium text-blue-700">{job.company}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{job.location}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Đăng {formatPosted(job.postedAt)}</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-medium text-slate-500">Mức lương</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  {job.salary}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-medium text-slate-500">Địa điểm</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  {job.location}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-blue-100/70 pt-6">
              <h2 className="text-sm font-semibold text-slate-800">Mô tả</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                {job.description}
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-8">
            <ApplyJobCard
              jobId={job.id}
              company={job.company}
              type={job.type}
              postedAtLabel={formatPosted(job.postedAt)}
            />

            <div className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-sm shadow-blue-900/5">
              <h2 className="text-sm font-semibold text-slate-800">
                Quy trình tuyển dụng
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Chúng tôi phản hồi hồ sơ trong vòng 3-5 ngày làm việc.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  1. Sàng lọc hồ sơ
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  2. Phỏng vấn chuyên môn
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  3. Phỏng vấn văn hóa
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

