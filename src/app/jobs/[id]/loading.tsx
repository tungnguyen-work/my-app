export default function LoadingJobDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm shadow-blue-900/5 sm:p-8">
            <div className="h-3 w-28 rounded bg-blue-100" />
            <div className="mt-3 h-8 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="h-24 rounded-2xl border border-blue-100 bg-blue-50/60" />
              <div className="h-24 rounded-2xl border border-blue-100 bg-blue-50/60" />
            </div>
            <div className="mt-7 space-y-3 border-t border-blue-100/70 pt-6">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-4/5 rounded bg-slate-200" />
            </div>
          </section>
          <aside className="space-y-4">
            <div className="h-64 rounded-2xl border border-blue-100/80 bg-white shadow-sm shadow-blue-900/5" />
            <div className="h-36 rounded-2xl border border-blue-100/80 bg-white shadow-sm shadow-blue-900/5" />
          </aside>
        </div>
      </main>
    </div>
  );
}

