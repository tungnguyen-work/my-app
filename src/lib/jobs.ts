import type { Job } from "@/types/job";

import { supabase } from "@/lib/supabase";

type JobRow = {
  id: string | number;
  title: string | null;
  company: string | null;
  location: string | null;
  type: string | null;
  salary: string | null;
  description: string | null;
  postedAt?: string | null;
  posted_at?: string | null;
  created_at?: string | null;
  user_id?: string | null;
};

const ALLOWED_TYPES: Job["type"][] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
];

function normalizeType(value: string | null): Job["type"] {
  if (!value) return "Full-time";
  return ALLOWED_TYPES.includes(value as Job["type"])
    ? (value as Job["type"])
    : "Full-time";
}

function mapJob(row: JobRow): Job {
  return {
    id: String(row.id),
    title: row.title ?? "Untitled role",
    company: row.company ?? "Unknown company",
    location: row.location ?? "Remote",
    type: normalizeType(row.type),
    salary: row.salary ?? "Negotiable",
    description: row.description ?? "No description provided.",
    postedAt: row.posted_at ?? row.postedAt ?? row.created_at ?? new Date().toISOString(),
    userId: row.user_id ?? null,
  };
}

export type JobsResult = {
  jobs: Job[];
  error: string | null;
};

export async function getJobs(): Promise<JobsResult> {
  try {
    const { data, error } = await supabase.from("jobs").select("*");
    if (error) {
      const message = `Failed to load jobs: ${error.message}`;
      console.error(message);
      return { jobs: [], error: message };
    }

    return { jobs: (data as JobRow[]).map(mapJob), error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while loading jobs";
    console.error("Failed to load jobs:", error);
    return { jobs: [], error: message };
  }
}

export async function getJobById(id: string): Promise<{ job: Job | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      const message = `Failed to load job ${id}: ${error.message}`;
      console.error(message);
      return { job: null, error: message };
    }

    if (!data) return { job: null, error: null };
    return { job: mapJob(data as JobRow), error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while loading job";
    console.error("Failed to load job:", error);
    return { job: null, error: message };
  }
}

