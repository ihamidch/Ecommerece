import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatOrderStatus } from '../utils/orderStatus'
import { Skeleton } from '../components/ui/Skeleton'

function UserDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/user')
        setOrders(data)
      } catch (e) {
        toast.error(e.response?.data?.message || 'Could not load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your orders</h1>
        <p className="mt-2 text-slate-600">
          Signed in as <span className="font-semibold text-slate-900">{user?.name}</span> ({user?.email})
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Order</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Fulfillment</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Payment</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order._id} className="bg-white hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">…{order._id.slice(-8)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatOrderStatus(order.status)}</td>
                      <td className="px-4 py-3 capitalize text-slate-600">{order.paymentStatus}</td>
                      <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                        {order.items?.map((i) => `${i.quantity}× ${i.name}`).join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && orders.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">No orders yet — your history will appear here.</p>
        ) : null}
      </div>
    </div>
  )
}

export default UserDashboardPage
