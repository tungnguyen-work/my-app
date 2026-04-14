"use client";

import { useMemo, useState } from "react";

import type { Job } from "@/types/job";
import { JobCard } from "@/components/JobCard";

const CATEGORY_RULES: { label: string; test: (job: Job) => boolean }[] = [
  {
    label: "Full Stack",
    test: (j) => /full stack/i.test(j.title),
  },
  {
    label: "Frontend",
    test: (j) => /frontend/i.test(j.title),
  },
  {
    label: "Backend",
    test: (j) => /backend/i.test(j.title) && !/full stack/i.test(j.title),
  },
  {
    label: "DevOps",
    test: () => false,
  },
  {
    label: "Data & AI",
    test: () => false,
  },
];

export function JobBoard({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return jobs;

    return jobs.filter((job) => {
      const searchable = [
        job.title,
        job.company,
        job.location,
        job.type,
        job.description,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [jobs, query]);

  const categories = useMemo(
    () =>
      CATEGORY_RULES.map(({ label, test }) => ({
        label,
        count: filteredJobs.filter(test).length,
      })),
    [filteredJobs],
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-6 rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm shadow-blue-900/5 sm:p-5">
        <label
          htmlFor="job-search"
          className="text-sm font-semibold text-slate-800"
        >
          Tìm việc phù hợp
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Tìm theo tên vị trí, công ty, địa điểm hoặc kỹ năng.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            id="job-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: Frontend, React, Google, Seattle..."
            className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-xl border border-blue-200 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
        <section aria-labelledby="jobs-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="jobs-heading" className="text-sm font-semibold text-slate-800">
              Danh sách việc làm
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {filteredJobs.length} kết quả
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-600 shadow-sm shadow-blue-900/5">
              Không tìm thấy việc làm phù hợp với từ khóa{" "}
              <span className="font-medium text-slate-900">"{query}"</span>.
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredJobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="categories-heading"
          className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-sm shadow-blue-900/5 lg:sticky lg:top-8"
        >
          <h2
            id="categories-heading"
            className="text-sm font-semibold text-slate-800"
          >
            Danh mục phổ biến
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Cập nhật theo kết quả tìm kiếm hiện tại.
          </p>
          <ul className="mt-4 space-y-2">
            {categories.map(({ label, count }) => (
              <li key={label}>
                <div className="flex items-center justify-between rounded-xl bg-blue-50/60 px-3 py-2.5 text-sm transition-colors hover:bg-blue-100/80">
                  <span className="font-medium text-slate-800">{label}</span>
                  <span className="tabular-nums text-xs text-blue-700">{count}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

