import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-6">Page not found</h1>
      <p className="text-muted">The page you requested does not exist.</p>
      <Link to="/" className="btn btn-primary mt-2">
        Back to home
      </Link>
    </div>
  )
}

export default NotFoundPage
