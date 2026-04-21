import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
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
  const { cartItems, subtotal, clearCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('mock')
  const [loading, setLoading] = useState(false)

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
      let paymentStatus = 'paid'

      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/orders/payment-intent', { amount: subtotal })
        paymentStatus = data.mode === 'mock' ? 'paid' : 'pending'
      }

      const { data: order } = await api.post('/orders', {
        cartItems,
        shippingAddress,
        paymentMethod,
        paymentStatus,
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
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
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
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="radio"
                  className="h-4 w-4 border-slate-300 text-indigo-600"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                />
                Stripe (when configured)
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Placing order…' : 'Place order'}
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
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default CheckoutPage
