import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
            Xác minh tài khoản
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Kiểm tra email của bạn
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Chúng tôi đã gửi liên kết xác minh đến{" "}
            <span className="font-medium text-slate-900">{email ?? "địa chỉ email của bạn"}</span>.
            Vui lòng mở hộp thư và nhấn vào liên kết để hoàn tất đăng ký.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Không thấy email? Hãy kiểm tra mục Spam/Promotions hoặc đợi 1-2 phút rồi thử lại.
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              href="/auth"
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Về trang đăng nhập
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-700">
              Quay lại trang chủ
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
