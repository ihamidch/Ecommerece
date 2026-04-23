import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'

const initialAddress = {
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
}

const FIELD_LABELS = {
  fullName: 'Full name',
  address: 'Street address',
  city: 'City',
  postalCode: 'Postal code',
  country: 'Country',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { cartItems, subtotal, clearCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('mock')
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const shippingCost = 0
  const finalTotal = subtotal + shippingCost

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const { data } = await api.get('/orders/stripe/config')
        if (ignore) return
        const enabled = Boolean(data?.stripeEnabled)
        setStripeEnabled(enabled)
        if (!enabled) {
          setPaymentMethod((m) => (m === 'stripe' ? 'mock' : m))
        }
      } catch {
        if (!ignore) {
          setStripeEnabled(false)
          setPaymentMethod((m) => (m === 'stripe' ? 'mock' : m))
        }
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('cancelled') === '1') {
      toast.info('Stripe checkout was cancelled')
      const next = new URLSearchParams(searchParams)
      next.delete('cancelled')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleChange = (event) => {
    setShippingAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    try {
      setLoading(true)

      if (paymentMethod === 'stripe') {
        if (!stripeEnabled) {
          toast.error('Stripe is not configured on the server. Use mock payment or add STRIPE_SECRET_KEY.')
          return
        }

        const origin = window.location.origin
        const successUrl = `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl = `${origin}/checkout?cancelled=1`

        const { data } = await api.post('/orders/checkout-session', {
          cartItems,
          shippingAddress,
          successUrl,
          cancelUrl,
        })

        if (!data?.checkoutUrl) {
          toast.error('Could not start Stripe checkout')
          return
        }

        window.location.assign(data.checkoutUrl)
        return
      }

      const { data: order } = await api.post('/orders', {
        cartItems,
        shippingAddress,
        paymentMethod: 'mock',
        paymentStatus: 'paid',
      })

      clearCart()
      toast.success('Order placed successfully')
      navigate(`/order-success/${order._id}`, { state: { order } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-slate-700">Your cart is empty. Add products before checkout.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="surface-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide sm:text-sm">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">Cart</span>
          <span className="h-px flex-1 bg-slate-200" />
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-white">Checkout</span>
          <span className="h-px flex-1 bg-slate-200" />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">Success</span>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
          </div>
          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Shipping info</h2>
              <div className="mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
                <p className="text-slate-600">
                  Name: <span className="font-semibold text-slate-900">{user?.name || 'Guest'}</span>
                </p>
                <p className="text-slate-600">
                  Email: <span className="font-semibold text-slate-900">{user?.email || 'Not available'}</span>
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Address details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Object.keys(initialAddress).map((field) => (
                  <label key={field} className="block text-sm sm:col-span-1">
                    <span className="mb-1 block font-medium text-slate-700">{FIELD_LABELS[field]}</span>
                    <input
                      required
                      name={field}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                      value={shippingAddress[field]}
                      onChange={handleChange}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="radio"
                    className="h-4 w-4 border-slate-300 text-indigo-600"
                    checked={paymentMethod === 'mock'}
                    onChange={() => setPaymentMethod('mock')}
                  />
                  Mock payment (instant)
                </label>
                <label
                  className={`flex items-center gap-2 text-sm font-medium ${
                    stripeEnabled ? 'cursor-pointer text-slate-800' : 'cursor-not-allowed text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    className="h-4 w-4 border-slate-300 text-indigo-600 disabled:opacity-50"
                    checked={paymentMethod === 'stripe'}
                    disabled={!stripeEnabled}
                    onChange={() => setPaymentMethod('stripe')}
                  />
                  {stripeEnabled ? 'Card (Stripe Checkout)' : 'Card (Stripe — add STRIPE_SECRET_KEY on API)'}
                </label>
              </div>
              {stripeEnabled ? (
                <p className="mt-3 text-xs text-slate-500">
                  You will be redirected to Stripe to pay securely. Your order is created only after payment succeeds.
                </p>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  For real card payments, configure <span className="font-mono">STRIPE_SECRET_KEY</span> on the backend
                  (test mode is fine) and redeploy the API.
                </p>
              )}
            </section>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (paymentMethod === 'stripe' ? 'Redirecting…' : 'Placing order…') : 'Place order'}
            </button>
          </form>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto text-sm">
              {cartItems.map((item, index) => (
                <li key={item.productId} className="flex gap-3">
                  <img
                    src={getProductImage(item, index)}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ${Number(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-800">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                <span>Final total</span>
                <span className="text-indigo-700">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
