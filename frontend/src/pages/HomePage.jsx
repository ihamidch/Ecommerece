import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getProductImage } from '../utils/productImage'
import { ProductCardSkeleton } from '../components/ui/Skeleton'

function HomePage() {
  const { addToCart } = useCart()
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (category) params.category = category
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      const { data } = await api.get('/products', { params })
      setProducts(data)
      setError('')
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/products/categories').catch(() => ({ data: [] })),
          api.get('/products', { params: {} }),
        ])
        if (cancelled) return
        setCategories(Array.isArray(catRes.data) ? catRes.data : [])
        setProducts(prodRes.data)
        setError('')
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.response?.data?.message || 'Failed to load products')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    fetchProducts()
  }

  const featured = products.slice(0, 3)

  return (
    <div className="space-y-10">
      <section className="animate-enter-slow relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/60 p-8 shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Featured portfolio project</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            MERN E-commerce Platform
          </h1>
          <p className="mt-3 text-slate-600">
            Production-ready full-stack application with authentication and admin system
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="badge-pill shadow-sm">
              <strong className="text-indigo-600">{products.length}</strong> products
            </span>
            <span className="badge-pill shadow-sm">
              <strong className="text-indigo-600">{categories.length || 1}</strong> categories
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700"
            >
              Shop Now
            </a>
            <Link
              to="/admin/products"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              {isAdmin ? 'Admin Dashboard' : 'Admin Dashboard'}
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <div className="animate-enter flex flex-wrap gap-2">
          {featured.map((product, index) => (
            <span
              key={product._id}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
            >
              <span className="mr-2 text-indigo-500">#{index + 1}</span>
              {product.category} · {product.name}
            </span>
          ))}
        </div>
      ) : null}

      <form
        className="surface-card animate-enter grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={handleFilterSubmit}
      >
        <input
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-500/0 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 lg:col-span-2"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 lg:col-span-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          min="0"
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 sm:col-span-2 lg:col-span-1"
        >
          Apply filters
        </button>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <div id="catalog" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product, index) => (
              <article
                key={product._id}
                className="group surface-card surface-card-hover animate-enter flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={getProductImage(product, index)}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                      {product.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        Number(product.stock) > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{product.description}</p>
                  <p className="mt-4 text-xl font-bold text-indigo-700">${Number(product.price).toFixed(2)}</p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                      onClick={() => {
                        addToCart(product)
                        toast.success('Added to cart', { description: product.name })
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
      </div>

      {!loading && products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
          <p className="text-slate-600">No products match your filters.</p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
            onClick={async () => {
              setSearch('')
              setCategory('')
              setMinPrice('')
              setMaxPrice('')
              try {
                setLoading(true)
                const { data } = await api.get('/products')
                setProducts(data)
                setError('')
              } catch (fetchError) {
                setError(fetchError.response?.data?.message || 'Failed to load products')
              } finally {
                setLoading(false)
              }
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default HomePage
