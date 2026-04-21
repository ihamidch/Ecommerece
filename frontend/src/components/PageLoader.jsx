function PageLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">Loading…</p>
    </div>
  )
}

export default PageLoader
