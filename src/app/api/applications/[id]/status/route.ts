import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_STATUS = ["new", "reviewed", "interviewed", "rejected", "hired"];

type ApplicationOwnershipRow = {
  id: string | number;
  jobs: {
    user_id: string | null;
  } | null;
};

export async function PATCH(
  request: NextRequest,
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

  const body = (await request.json()) as { status?: string };
  const nextStatus = body.status?.trim().toLowerCase();
  if (!nextStatus || !ALLOWED_STATUS.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, jobs!inner(user_id)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const application = data as unknown as ApplicationOwnershipRow;
  if (application.jobs?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: nextStatus })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
