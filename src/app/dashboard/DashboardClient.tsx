"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DashboardJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  createdAt: string | null;
};

type DashboardApplication = {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  resumePath: string;
  createdAt: string | null;
  status: string | null;
};

type DashboardClientProps = {
  jobs: DashboardJob[];
  applications: DashboardApplication[];
  userEmail: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "new", label: "Mới" },
  { value: "reviewed", label: "Đã xem" },
  { value: "interviewed", label: "Đã phỏng vấn" },
  { value: "rejected", label: "Từ chối" },
  { value: "hired", label: "Đạt" },
] as const;

const PAGE_SIZE = 5;

function formatDate(value?: string | null) {
  if (!value) return "Không rõ";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeStatus(status: string | null) {
  return status?.trim().toLowerCase() || "new";
}

function statusLabel(status: string | null) {
  const normalized = normalizeStatus(status);
  const found = STATUS_OPTIONS.find((item) => item.value === normalized);
  return found?.label ?? "Mới";
}

export default function DashboardClient({
  jobs,
  applications,
  userEmail,
}: DashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [currentPageByJob, setCurrentPageByJob] = useState<Record<string, number>>({});
  const [statusByApplication, setStatusByApplication] = useState<Record<string, string>>(
    Object.fromEntries(applications.map((item) => [item.id, normalizeStatus(item.status)])),
  );
  const [previewResumeUrl, setPreviewResumeUrl] = useState<string | null>(null);
  const [previewCandidateName, setPreviewCandidateName] = useState<string>("");
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [errorByJob, setErrorByJob] = useState<Record<string, string | null>>({});

  const applicationsByJob = useMemo(() => {
    return applications.reduce<Record<string, DashboardApplication[]>>((acc, current) => {
      if (!acc[current.jobId]) acc[current.jobId] = [];
      const merged = {
        ...current,
        status: statusByApplication[current.id] ?? normalizeStatus(current.status),
      };
      acc[current.jobId].push(merged);
      return acc;
    }, {});
  }, [applications, statusByApplication]);

  const totalApplicants = applications.length;

  async function openResume(applicationId: string, jobId: string, candidateName: string) {
    setErrorByJob((prev) => ({ ...prev, [jobId]: null }));
    setLoadingResumeId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/resume-url`);
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Không thể tạo liên kết CV.");
      }
      setPreviewCandidateName(candidateName);
      setPreviewResumeUrl(data.url as string);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể mở CV.";
      setErrorByJob((prev) => ({ ...prev, [jobId]: message }));
    } finally {
      setLoadingResumeId(null);
    }
  }

  async function updateApplicationStatus(applicationId: string, nextStatus: string, jobId: string) {
    setErrorByJob((prev) => ({ ...prev, [jobId]: null }));
    setUpdatingStatusId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Không thể cập nhật trạng thái.");
      }
      setStatusByApplication((prev) => ({ ...prev, [applicationId]: nextStatus }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật trạng thái.";
      setErrorByJob((prev) => ({ ...prev, [jobId]: message }));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5">
          <p className="text-xs text-slate-500">Tổng bài đăng</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5">
          <p className="text-xs text-slate-500">Tổng ứng viên</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalApplicants}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5">
          <p className="text-xs text-slate-500">Tài khoản</p>
          <p className="mt-2 truncate text-sm font-medium text-slate-800">{userEmail}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm shadow-blue-900/5">
        <label htmlFor="statusFilter" className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Lọc hồ sơ theo trạng thái
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]["value"])}
          className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-600 focus:ring-2 sm:w-72"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <section className="mt-6 space-y-4">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-600">
            Bạn chưa có bài đăng nào. Hãy tạo bài đăng đầu tiên để bắt đầu tuyển dụng.
          </div>
        ) : (
          jobs.map((job) => {
            const allApplications = applicationsByJob[job.id] ?? [];
            const filteredApplications =
              statusFilter === "all"
                ? allApplications
                : allApplications.filter((item) => normalizeStatus(item.status) === statusFilter);
            const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
            const currentPage = Math.min(currentPageByJob[job.id] ?? 1, totalPages);
            const pageStart = (currentPage - 1) * PAGE_SIZE;
            const pagedApplications = filteredApplications.slice(pageStart, pageStart + PAGE_SIZE);

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm shadow-blue-900/5 sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Đăng ngày {formatDate(job.createdAt)}</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">{job.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {job.company} - {job.location}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{job.salary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {job.type}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Xem bài đăng
                    </Link>
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Chỉnh sửa
                    </Link>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">Ứng viên đã ứng tuyển</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {filteredApplications.length} hồ sơ phù hợp bộ lọc
                    </span>
                  </div>

                  {errorByJob[job.id] && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      {errorByJob[job.id]}
                    </div>
                  )}

                  {pagedApplications.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Không có hồ sơ cho bộ lọc hiện tại.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {pagedApplications.map((application) => (
                        <li
                          key={application.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {application.candidateName}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">{application.candidateEmail}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Nộp ngày {formatDate(application.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={normalizeStatus(application.status)}
                                onChange={(event) =>
                                  updateApplicationStatus(
                                    application.id,
                                    event.target.value,
                                    application.jobId,
                                  )
                                }
                                disabled={updatingStatusId === application.id}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() =>
                                  openResume(
                                    application.id,
                                    application.jobId,
                                    application.candidateName,
                                  )
                                }
                                disabled={loadingResumeId === application.id}
                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {loadingResumeId === application.id ? "Đang mở..." : "Xem CV"}
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            Trạng thái hiện tại: {statusLabel(application.status)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPageByJob((prev) => ({
                            ...prev,
                            [job.id]: Math.max(1, (prev[job.id] ?? 1) - 1),
                          }))
                        }
                        disabled={currentPage <= 1}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-slate-500">
                        Trang {currentPage}/{totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPageByJob((prev) => ({
                            ...prev,
                            [job.id]: Math.min(totalPages, (prev[job.id] ?? 1) + 1),
                          }))
                        }
                        disabled={currentPage >= totalPages}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {previewResumeUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 p-1 sm:p-3">
          <div className="flex h-[96vh] w-[99vw] max-w-[1600px] flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:h-[94vh] sm:w-[97vw] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">CV ứng viên</p>
                <p className="text-xs text-slate-500">{previewCandidateName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewResumeUrl}
                  download
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Tải xuống
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewResumeUrl(null);
                    setPreviewCandidateName("");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>
            <iframe
              title="CV Preview"
              src={`${previewResumeUrl}#zoom=300&view=FitH`}
              className="h-full w-full bg-slate-100"
            />
          </div>
        </div>
      )}
    </>
  );
}

