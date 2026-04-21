import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white px-8 py-16 text-center shadow-card">
      <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you requested does not exist or was moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </div>
  )
}

export default NotFoundPage
