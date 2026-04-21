import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'
import { Skeleton } from '../components/ui/Skeleton'

function ProductDetailsPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/products/${id}`)
        if (!cancelled) {
          setProduct(data)
          setError('')
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.response?.data?.message || 'Unable to fetch product')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProduct()
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">
        <p>{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-indigo-700 hover:underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  if (loading || !product) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl lg:aspect-auto lg:min-h-[420px]" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-11/12" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    )
  }

  const maxQty = Math.max(1, product.stock || 1)

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
        <img
          className="aspect-square w-full object-cover lg:aspect-auto lg:max-h-[520px]"
          src={getProductImage(product)}
          alt={product.name}
          loading="eager"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {product.category}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              Number(product.stock) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {Number(product.stock) > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>
        <p className="mt-6 whitespace-pre-line text-slate-600 leading-relaxed">{product.description}</p>
        <p className="mt-8 text-4xl font-bold text-indigo-700">${Number(product.price).toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{product.stock}</span> in stock
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <label htmlFor="qty" className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
            className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
            onClick={() => {
              addToCart(product, quantity)
              toast.success('Added to cart', { description: `${quantity} × ${product.name}` })
            }}
          >
            Add to cart
          </button>
          <Link
            to="/cart"
            className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            View cart
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
