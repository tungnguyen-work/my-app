"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

type OwnerJobActionsProps = {
  jobId: string;
};

export default function OwnerJobActions({ jobId }: OwnerJobActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm("Bạn chắc chắn muốn xóa bài đăng này?");
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Bạn cần đăng nhập để thực hiện thao tác này.");
      setIsDeleting(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(`Không thể xóa bài đăng: ${deleteError.message}`);
      setIsDeleting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mt-6 border-t border-blue-100/70 pt-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/jobs/${jobId}/edit`}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
        >
          Sửa
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? "Đang xóa..." : "Xóa"}
        </button>
      </div>
      {error && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
