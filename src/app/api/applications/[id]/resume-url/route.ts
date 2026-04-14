import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type ApplicationOwnershipRow = {
  id: string | number;
  resume_url: string | null;
  job_id: string | number | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, resume_url, job_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const application = data as unknown as ApplicationOwnershipRow;
  if (!application.job_id) {
    return NextResponse.json({ error: "Application is missing job_id." }, { status: 400 });
  }

  const { data: jobData, error: jobError } = await supabase
    .from("jobs")
    .select("user_id")
    .eq("id", String(application.job_id))
    .maybeSingle();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 400 });
  }

  if (!jobData || jobData.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const resumePath = application.resume_url ?? "";
  if (!resumePath) {
    return NextResponse.json({ error: "Resume path is missing." }, { status: 400 });
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from("application-resumes")
    .createSignedUrl(resumePath, 60);

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: signError?.message || "Cannot create signed URL." },
      { status: 400 },
    );
  }

  return NextResponse.json({ url: signedData.signedUrl });
}
