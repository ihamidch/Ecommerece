import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginSignupPage() {
  const { isAuthenticated, login, signup } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)
      if (isLogin) {
        await login(email, password)
      } else {
        await signup({ name, email, password })
      }
    } catch (authError) {
      setError(authError.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h1 className="h4 mb-3">{isLogin ? 'Login' : 'Create account'}</h1>
            {error ? <div className="alert alert-danger">{error}</div> : null}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    required
                    className="form-control"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  required
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  required
                  type="password"
                  minLength="6"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
              </button>
            </form>
            <button
              className="btn btn-link w-100 mt-2"
              onClick={() => setIsLogin((prev) => !prev)}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSignupPage
