import { notFound, redirect } from "next/navigation";

import EditJobForm from "./EditJobForm";
import { getJobById } from "@/lib/jobs";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedId = decodeURIComponent(id).trim();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/jobs/${normalizedId}/edit`)}`);
  }

  const { job, error } = await getJobById(normalizedId);

  if (error) {
    throw new Error(error);
  }

  if (!job) notFound();

  if (job.userId !== user.id) {
    redirect(`/jobs/${normalizedId}`);
  }

  return (
    <EditJobForm
      jobId={job.id}
      initialData={{
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
      }}
    />
  );
}
