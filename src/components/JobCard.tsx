import Link from "next/link";
import type { Job } from "@/types/job";

function formatPosted(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="group rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 transition-shadow hover:shadow-md hover:shadow-blue-900/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-blue-700">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm font-medium text-blue-600">{job.company}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {job.type}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
        {job.description}
      </p>
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Địa điểm</dt>
          <dd>{job.location}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Mức lương</dt>
          <dd className="font-medium text-slate-600">{job.salary}</dd>
        </div>
        <div className="w-full text-slate-400">
          <dt className="sr-only">Đăng ngày</dt>
          <dd>Đăng {formatPosted(job.postedAt)}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
