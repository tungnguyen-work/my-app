import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthActions } from "@/components/AuthActions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string | number;
  title: string | null;
  company: string | null;
  location: string | null;
  type: string | null;
  salary: string | null;
  created_at?: string | null;
};

type ApplicationRow = {
  id: string | number;
  job_id: string | number | null;
  candidate_name: string | null;
  candidate_email: string | null;
  resume_url: string | null;
  created_at?: string | null;
  status?: string | null;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/dashboard");
  }

  const { data: jobsData, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, company, location, type, salary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  const jobs = (jobsData ?? []) as JobRow[];
  const jobIds = jobs.map((job) => String(job.id));

  let applications: ApplicationRow[] = [];
  if (jobIds.length > 0) {
    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select("*")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (applicationError) {
      throw new Error(applicationError.message);
    }
    applications = (applicationData ?? []) as ApplicationRow[];
  }

  const dashboardJobs = jobs.map((job) => ({
    id: String(job.id),
    title: job.title ?? "Untitled role",
    company: job.company ?? "Unknown company",
    location: job.location ?? "Remote",
    type: job.type ?? "Full-time",
    salary: job.salary ?? "Negotiable",
    createdAt: job.created_at ?? null,
  }));

  const dashboardApplications = applications.map((application) => ({
    id: String(application.id),
    jobId: String(application.job_id ?? ""),
    candidateName: application.candidate_name ?? "Không có tên",
    candidateEmail: application.candidate_email ?? "Không có email",
    resumePath: application.resume_url ?? "",
    createdAt: application.created_at ?? null,
    status: application.status ?? null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <header className="border-b border-blue-100/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Quản lý bài đăng của tôi
            </h1>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <Link
              href="/jobs/new"
              className="rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm shadow-blue-900/5 transition-colors hover:bg-blue-50 sm:px-4 sm:text-sm"
            >
              Đăng tin mới
            </Link>
            <AuthActions />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <DashboardClient
          jobs={dashboardJobs}
          applications={dashboardApplications}
          userEmail={user.email ?? "Unknown user"}
        />
      </main>
    </div>
  );
}
