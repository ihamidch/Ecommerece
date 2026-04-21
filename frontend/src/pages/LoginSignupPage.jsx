import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

function LoginSignupPage() {
  const { isAuthenticated, login, signup } = useAuth()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from === '/auth' ? '/dashboard' : from} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)
      if (isLogin) {
        await login(email, password)
        toast.success('Welcome back')
      } else {
        await signup({ name, email, password })
        toast.success('Account created')
      }
    } catch (authError) {
      const msg = authError.response?.data?.message || 'Authentication failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-card backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Secure access</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{isLogin ? 'Sign in' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin ? 'JWT session · role-based dashboard' : 'Join the storefront in seconds'}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Full name</span>
              <input
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Password</span>
            <input
              required
              type="password"
              minLength={6}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <span className="mt-1 block text-xs text-slate-500">At least 6 characters</span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          className="mt-6 w-full text-center text-sm font-medium text-indigo-600 hover:underline"
          onClick={() => {
            setIsLogin((p) => !p)
            setError('')
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  )
}

export default LoginSignupPage
