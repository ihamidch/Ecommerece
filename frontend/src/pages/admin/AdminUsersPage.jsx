import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../api/client'
import { Skeleton } from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const adminCount = users.filter((u) => u.role === 'admin').length

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount load
    fetchUsers()
  }, [])

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role })
      toast.success('Role updated')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update role')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Manage users</h1>
        <p className="section-subtitle">
          View registered accounts and assign admin privileges carefully.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={users.length} />
        <StatCard label="Admins" value={adminCount} tone="indigo" />
        <StatCard label="Customers" value={users.length - adminCount} tone="emerald" />
      </section>

      <div className="table-shell animate-enter">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Joined</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u._id} className="table-row">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold capitalize text-slate-800 outline-none focus:ring-2 focus:ring-brand-500/30"
                          value={u.role}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && users.length === 0 ? (
          <p className="bg-white px-4 py-10 text-center text-sm text-slate-500">No users found.</p>
        ) : null}
      </div>
    </div>
  )
}

export default AdminUsersPage
