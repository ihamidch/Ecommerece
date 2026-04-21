import { memo, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'
import { Skeleton } from '../components/ui/Skeleton'

const CartItem = memo(function CartItem({
  item,
  index,
  onDecrease,
  onIncrease,
  onRemove,
}) {
  const lineTotal = Number(item.price) * item.quantity

  return (
    <li className="surface-card surface-card-hover group flex gap-4 p-4 transition-all sm:p-5">
      <img
        src={getProductImage(item, index)}
        alt={item.name}
        className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-slate-100 sm:h-28 sm:w-32"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="line-clamp-2 text-base font-semibold text-slate-900 sm:text-lg">{item.name}</h2>
            <p className="mt-1 text-sm font-medium text-indigo-700">${Number(item.price).toFixed(2)} each</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            title="Remove item"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              className="px-3 py-1.5 text-lg font-semibold text-slate-600 transition hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
              onClick={onDecrease}
            >
              −
            </button>
            <span className="min-w-[2.25rem] text-center text-sm font-semibold text-slate-900">
              {item.quantity}
            </span>
            <button
              type="button"
              className="px-3 py-1.5 text-lg font-semibold text-slate-600 transition hover:bg-white active:scale-95"
              aria-label="Increase quantity"
              onClick={onIncrease}
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Line total</p>
            <p className="text-lg font-bold text-slate-900">${lineTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </li>
  )
})

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, count, isCartReady, subtotal, updateQuantity, removeFromCart } = useCart()
  const previousCountRef = useRef(count)

  const shipping = useMemo(() => 0, [])
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping])

  useEffect(() => {
    if (previousCountRef.current > 0 && count > previousCountRef.current) {
      toast.success('Item added to cart')
    }
    previousCountRef.current = count
  }, [count])

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
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 6H7" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Browse the catalog and add items to see them here.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
      <section className="lg:col-span-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="kicker">Cart</p>
            <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">{count} item(s)</p>
        </div>
        <ul className="mt-6 space-y-4">
          {cartItems.map((item, index) => (
            <CartItem
              key={item.productId}
              item={item}
              index={index}
              onDecrease={() => {
                updateQuantity(item.productId, item.quantity - 1)
                toast.success('Quantity updated')
              }}
              onIncrease={() => {
                updateQuantity(item.productId, item.quantity + 1)
                toast.success('Quantity updated')
              }}
              onRemove={() => {
                removeFromCart(item.productId)
                toast.success('Item removed')
              }}
            />
          ))}
        </ul>
      </section>

      <aside className="lg:col-span-1">
        <div className="surface-card sticky top-28 p-6 shadow-card-hover">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-2 border-b border-slate-200 pb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-700">Free</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-indigo-700">${total.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Taxes are calculated during checkout.</p>
          <button
            type="button"
            className="btn-primary mt-6 w-full py-3.5"
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
