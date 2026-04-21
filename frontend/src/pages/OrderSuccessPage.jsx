import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { Skeleton } from '../components/ui/Skeleton'

function OrderSuccessPage() {
  const { id } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!location.state?.order)

  useEffect(() => {
    if (order) return
    let cancelled = false

    const loadOrder = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/orders/${id}`)
        if (!cancelled) setOrder(data)
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Unable to load order details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      cancelled = true
    }
  }, [id, order])

  if (loading) {
    return (
      <div className="surface-card mx-auto max-w-3xl space-y-4 p-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="surface-card mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Order details unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">We could not load this order right now.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Go to your orders
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-enter mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
      <section className="surface-card lg:col-span-2 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Thank you for your purchase</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your order has been created successfully and is now being processed.
        </p>
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
          <p className="font-semibold text-emerald-800">Order ID</p>
          <p className="mt-1 font-mono text-emerald-700">{order._id}</p>
        </div>
        <div className="mt-6 space-y-3">
          {order.items?.map((item) => (
            <div key={`${item.product}-${item.name}`} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
              <p className="text-slate-700">
                {item.quantity} x {item.name}
              </p>
              <p className="font-semibold text-slate-900">
                ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <aside className="surface-card h-fit p-6">
        <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex justify-between text-slate-600">
            <span>Status</span>
            <span className="font-semibold capitalize text-indigo-700">{order.status}</span>
          </p>
          <p className="flex justify-between text-slate-600">
            <span>Payment</span>
            <span className="font-semibold capitalize text-slate-900">{order.paymentStatus}</span>
          </p>
          <p className="flex justify-between text-slate-600">
            <span>Total</span>
            <span className="text-lg font-bold text-slate-900">${Number(order.totalAmount).toFixed(2)}</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/dashboard"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            View all orders
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default OrderSuccessPage
