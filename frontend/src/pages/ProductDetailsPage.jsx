import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getProductImage } from '../utils/productImage'
import { Skeleton } from '../components/ui/Skeleton'

function ProductDetailsPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [reviewRating, setReviewRating] = useState('5')
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

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

  const submitReview = async (event) => {
    event.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to submit a review')
      return
    }
    try {
      setSubmittingReview(true)
      await api.post(`/products/${id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment,
      })
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
      setReviewComment('')
      setReviewRating('5')
      toast.success('Review submitted')
    } catch (reviewError) {
      toast.error(reviewError.response?.data?.message || 'Unable to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="space-y-8">
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
        <p className="kicker">Product details</p>
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
        <p className="mt-2 text-sm font-medium text-amber-600">
          ★ {Number(product.rating || 0).toFixed(1)} ({Number(product.numReviews || 0)} reviews)
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{product.stock}</span> in stock
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <label htmlFor="qty" className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              className="px-3 py-2 text-lg font-bold text-slate-600 transition hover:bg-white"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
              className="w-16 border-x border-slate-200 bg-white px-2 py-2 text-center text-sm font-semibold outline-none"
            />
            <button
              type="button"
              className="px-3 py-2 text-lg font-bold text-slate-600 transition hover:bg-white"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary px-8 py-3"
            onClick={() => {
              addToCart(product, quantity)
              toast.success('Added to cart', { description: `${quantity} × ${product.name}` })
            }}
          >
            Add to cart
          </button>
          <Link
            to="/cart"
            className="btn-secondary px-8 py-3"
          >
            View cart
          </Link>
        </div>
      </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Customer reviews</h2>
          {Array.isArray(product.reviews) && product.reviews.length > 0 ? (
            <div className="mt-4 space-y-4">
              {product.reviews
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((review) => (
                  <article key={`${review.user}-${review.createdAt}`} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{review.name}</p>
                      <p className="text-sm font-medium text-amber-600">★ {Number(review.rating).toFixed(1)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  </article>
                ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>
          )}
        </div>

        <div className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Write a review</h2>
          <p className="mt-1 text-sm text-slate-500">You can update your review anytime.</p>
          <form className="mt-4 space-y-3" onSubmit={submitReview}>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Rating</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                value={reviewRating}
                onChange={(event) => setReviewRating(event.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Comment</span>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                placeholder="Share your experience with this product"
              />
            </label>
            <button
              type="submit"
              disabled={submittingReview}
              className="btn-primary px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingReview ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default ProductDetailsPage
