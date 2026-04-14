import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-blue-100/80 bg-white p-8 shadow-sm shadow-blue-900/5">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Không tìm thấy công việc
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Vị trí này có thể đã bị xóa hoặc đường dẫn chưa đúng. Hãy quay lại danh
            sách việc làm để chọn vị trí khác.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700"
          >
            Quay về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}

