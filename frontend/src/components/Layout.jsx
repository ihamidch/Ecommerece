import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import PageLoader from './PageLoader'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth')
    setMenuOpen(false)
  }

  const linkClass = ({ isActive }) =>
    clsx(
      'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-white/15 text-white shadow-inner shadow-white/10'
        : 'text-slate-200 hover:bg-white/10 hover:text-white'
    )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900/95 shadow-lg shadow-slate-900/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-white" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm text-white shadow-lg shadow-indigo-500/30">
              M
            </span>
            <span className="hidden sm:inline">MERN Shop</span>
          </Link>

          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-200 hover:bg-white/10 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav
            className={clsx(
              'absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-white/10 bg-slate-900/98 px-4 py-3 lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0',
              menuOpen ? 'flex' : 'hidden lg:flex'
            )}
          >
            <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/cart" className={linkClass} onClick={() => setMenuOpen(false)}>
              Cart
              {count > 0 ? (
                <span className="ml-1.5 rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white">
                  {count}
                </span>
              ) : null}
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Orders
                </NavLink>
                {isAdmin ? (
                  <NavLink to="/admin/products" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Admin
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-amber-200 hover:bg-white/10 lg:text-center"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={linkClass} onClick={() => setMenuOpen(false)}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Suspense fallback={<PageLoader />}>
          <div className="animate-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>

      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 backdrop-blur-sm">
        MERN commerce · JWT auth · role-based admin
      </footer>
    </div>
  )
}

export default Layout
