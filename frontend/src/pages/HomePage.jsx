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
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchProducts = async (nextPage = 1) => {
    try {
      setLoading(true)
      const params = { page: nextPage, limit: 9, sort: sortBy }
      if (search) params.search = search
      if (category) params.category = category
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (minRating) params.minRating = minRating

      const { data } = await api.get('/products', { params })
      if (Array.isArray(data)) {
        setProducts(data)
        setTotalItems(data.length)
        setTotalPages(1)
        setPage(1)
      } else {
        setProducts(Array.isArray(data?.items) ? data.items : [])
        setTotalItems(Number(data?.pagination?.totalItems || 0))
        setTotalPages(Number(data?.pagination?.totalPages || 1))
        setPage(Number(data?.pagination?.page || nextPage))
      }
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
          api.get('/products', { params: { page: 1, limit: 9, sort: sortBy } }),
        ])
        if (cancelled) return
        setCategories(Array.isArray(catRes.data) ? catRes.data : [])

        const payload = prodRes.data
        if (Array.isArray(payload)) {
          setProducts(payload)
          setTotalItems(payload.length)
          setTotalPages(1)
          setPage(1)
        } else {
          setProducts(Array.isArray(payload?.items) ? payload.items : [])
          setTotalItems(Number(payload?.pagination?.totalItems || 0))
          setTotalPages(Number(payload?.pagination?.totalPages || 1))
          setPage(Number(payload?.pagination?.page || 1))
        }
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
  }, [sortBy])

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    fetchProducts(1)
  }

  const featured = products.slice(0, 3)
  const featureItems = [
    { title: 'Secure Authentication', text: 'JWT-based login/registration with protected routes and secure session flows.' },
    { title: 'Admin Dashboard', text: 'Role-based admin controls for product, user, and order operations.' },
    { title: 'Cart & Checkout System', text: 'Smooth cart updates and guided checkout with clear order totals.' },
    { title: 'Order Management', text: 'Track lifecycle from placement to fulfillment with status visibility.' },
    { title: 'REST API Architecture', text: 'Frontend and backend linked through clean service-based API integrations.' },
  ]

  return (
    <div className="page-shell">
      <section className="animate-enter-slow relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/45 to-violet-50/70 p-8 text-center shadow-card sm:p-12">
        <div className="pointer-events-none absolute -left-16 top-1/3 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="kicker">SaaS Commerce Experience</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Modern E-commerce Platform</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">Full-stack MERN SaaS e-commerce solution with admin dashboard.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <span className="badge-pill shadow-sm"><strong className="text-indigo-600">{totalItems || products.length}</strong> products</span>
            <span className="badge-pill shadow-sm"><strong className="text-indigo-600">{categories.length || 1}</strong> categories</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#catalog" className="btn-primary">Shop Now</a>
            <a href="#catalog" className="btn-secondary">View Products</a>
            {isAdmin ? <Link to="/admin/products" className="btn-ghost">Admin Dashboard</Link> : null}
          </div>
        </div>
      </section>

      <section className="animate-enter space-y-4">
        <div><p className="kicker">Core capabilities</p><h2 className="section-title">Built like a production SaaS product</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {featureItems.map((item) => (
            <article key={item.title} className="feature-card">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <div className="animate-enter flex flex-wrap gap-2">
          {featured.map((product, index) => (
            <span key={product._id} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              <span className="mr-2 text-indigo-500">#{index + 1}</span>
              {product.category} · {product.name}
            </span>
          ))}
        </div>
      ) : null}

      <form className="surface-card animate-enter grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-8" onSubmit={handleFilterSubmit}>
        <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-500/0 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 lg:col-span-2" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 lg:col-span-1" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" min="0" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input type="number" min="0" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="">Any rating</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
          <option value="2">2★ & above</option>
          <option value="1">1★ & above</option>
        </select>
        <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="topRated">Top rated</option>
          <option value="priceAsc">Price: Low to high</option>
          <option value="priceDesc">Price: High to low</option>
        </select>
        <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 sm:col-span-2 lg:col-span-2">Apply filters</button>
      </form>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <div id="catalog" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product, index) => (
              <article key={product._id} className="group surface-card surface-card-hover animate-enter flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={getProductImage(product, index)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  <button type="button" className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-white" onClick={() => { addToCart(product); toast.success('Added to cart', { description: product.name }) }}>Quick Add</button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{product.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${Number(product.stock) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{product.description}</p>
                  <p className="mt-3 text-sm font-medium text-amber-600">★ {Number(product.rating || 0).toFixed(1)} ({Number(product.numReviews || 0)} reviews)</p>
                  <p className="mt-4 text-2xl font-bold text-indigo-700">${Number(product.price).toFixed(2)}</p>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/products/${product._id}`} className="btn-secondary flex-1 py-2.5 text-center">Details</Link>
                    <button type="button" className="btn-primary flex-1 py-2.5" onClick={() => { addToCart(product); toast.success('Added to cart', { description: product.name }) }}>Add to cart</button>
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
              setMinRating('')
              setSortBy('newest')
              try {
                setLoading(true)
                const { data } = await api.get('/products', { params: { page: 1, limit: 9, sort: 'newest' } })
                setProducts(Array.isArray(data?.items) ? data.items : [])
                setTotalItems(Number(data?.pagination?.totalItems || 0))
                setTotalPages(Number(data?.pagination?.totalPages || 1))
                setPage(1)
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

      {!loading && products.length > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button type="button" className="btn-secondary px-4 py-2" disabled={page <= 1} onClick={() => fetchProducts(page - 1)}>Previous</button>
          <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
          <button type="button" className="btn-secondary px-4 py-2" disabled={page >= totalPages} onClick={() => fetchProducts(page + 1)}>Next</button>
        </div>
      ) : null}
    </div>
  )
}

export default HomePage
