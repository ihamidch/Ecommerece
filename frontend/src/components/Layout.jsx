import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top glass-nav">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
            <span className="brand-badge">M</span>
            <span>MERN Shop</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navContent"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navContent">
            <ul className="navbar-nav ms-auto gap-2 align-items-lg-center">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/cart">
                  Cart ({count})
                </NavLink>
              </li>
              {user ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/dashboard">
                      Dashboard
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin">
                        Admin
                      </NavLink>
                    </li>
                  )}
                  <li className="nav-item">
                    <button type="button" className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/auth">
                    Login / Signup
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
