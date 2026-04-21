import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'
import { Skeleton } from '../components/ui/Skeleton'

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, isCartReady, subtotal, updateQuantity, removeFromCart } = useCart()

  if (!isCartReady) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-10 w-56" />
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="surface-card p-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
        <div className="surface-card h-fit p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-16 text-center shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Browse the catalog and add items to see them here.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
        <ul className="mt-6 space-y-4">
          {cartItems.map((item, index) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <img
                src={getProductImage(item, index)}
                alt={item.name}
                className="h-24 w-28 shrink-0 rounded-xl object-cover ring-1 ring-slate-100"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900">{item.name}</h2>
                <div className="mt-1 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  In cart
                </div>
                <p className="mt-1 text-sm font-medium text-slate-700">${Number(item.price).toFixed(2)} each</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-medium uppercase text-slate-500">Qty</span>
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-lg font-medium text-slate-600 hover:bg-white disabled:opacity-40"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-lg font-medium text-slate-600 hover:bg-white"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 hover:underline"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm text-slate-500">Line total</p>
                <p className="text-lg font-bold text-slate-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Taxes and shipping calculated at checkout (demo).</p>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </button>
          <Link to="/" className="mt-3 block text-center text-sm font-medium text-indigo-600 hover:underline">
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default CartPage
