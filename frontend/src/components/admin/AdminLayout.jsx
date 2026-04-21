import { NavLink, Outlet, Link } from 'react-router-dom'

const navItems = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
]

function AdminLayout() {
  return (
    <div className="space-y-6 animate-enter-slow">
      <section className="surface-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="kicker">Admin Console</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard Workspace</h1>
          <p className="mt-2 text-sm text-slate-600">Manage products, orders, and users with production-style controls.</p>
        </div>
        <Link
          to="/"
          className="btn-secondary"
        >
          ← Storefront
        </Link>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-60">
          <div className="surface-card overflow-hidden p-3">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Admin
            </p>
            <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                        : 'text-slate-700 hover:bg-slate-50 hover:shadow-sm',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
