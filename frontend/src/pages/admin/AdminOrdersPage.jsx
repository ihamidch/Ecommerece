import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../api/client'
import { formatOrderStatus } from '../../utils/orderStatus'
import { Skeleton } from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const statusBadge = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const pendingCount = orders.filter((o) => ['pending', 'processing'].includes(o.status)).length
  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/orders')
      setOrders(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount load
    fetchOrders()
  }, [])

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Manage orders</h1>
        <p className="section-subtitle">Review fulfillment pipeline and update shipment state.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total orders" value={orders.length} />
        <StatCard label="Pending fulfillment" value={pendingCount} tone="amber" />
        <StatCard label="Gross revenue" value={`$${revenue.toFixed(2)}`} tone="emerald" />
      </section>

      <div className="table-shell animate-enter">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Order</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order._id} className="table-row">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">…{order._id.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{order.user?.name || '—'}</p>
                        <p className="text-xs text-slate-500">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            statusBadge[order.status] || 'bg-slate-100 text-slate-700 ring-slate-200'
                          }`}
                        >
                          {formatOrderStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-500/30"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {formatOrderStatus(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && orders.length === 0 ? (
          <p className="bg-white px-4 py-10 text-center text-sm text-slate-500">No orders yet.</p>
        ) : null}
      </div>
    </div>
  )
}

export default AdminOrdersPage
