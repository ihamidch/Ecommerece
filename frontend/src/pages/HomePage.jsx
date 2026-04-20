import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'

function HomePage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products]
  )

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    fetchProducts()
  }

  const featured = products.slice(0, 3)

  return (
    <div>
      <section className="hero-banner mb-4 mb-lg-5">
        <div className="hero-glow" />
        <div className="position-relative">
          <p className="text-uppercase small fw-semibold mb-2 text-primary">Premium Storefront</p>
          <h1 className="display-6 fw-bold mb-2">Discover products you will love</h1>
          <p className="text-secondary mb-0">
            Shop smart with fast filters, seamless cart flow, and a modern checkout experience.
          </p>
          <div className="hero-stats mt-4">
            <div className="hero-chip">
              <strong>{products.length}+</strong> Curated products
            </div>
            <div className="hero-chip">
              <strong>{categories.length || 1}</strong> Categories
            </div>
            <div className="hero-chip">
              <strong>24/7</strong> Smart ordering
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mb-4">
          <div className="d-flex flex-wrap gap-2">
            {featured.map((product, index) => (
              <span key={product._id} className="badge rounded-pill text-bg-light feature-pill">
                #{index + 1} {product.category} - {product.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <form className="row g-2 mb-4 filter-panel" onSubmit={handleFilterSubmit}>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Min price"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Max price"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary fw-semibold">
            Apply
          </button>
        </div>
      </form>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? <p>Loading products...</p> : null}

      <div className="row g-4">
        {products.map((product, index) => (
          <div className="col-sm-6 col-lg-4" key={product._id}>
            <div className="card h-100 border-0 product-card">
              <img
                src={getProductImage(product, index)}
                className="card-img-top product-image"
                alt={product.name}
              />
              <div className="card-body d-flex flex-column">
                <h2 className="h5">{product.name}</h2>
                <p className="text-muted mb-2">{product.category}</p>
                <p className="small flex-grow-1">{product.description.slice(0, 110)}...</p>
                <p className="fw-bold">${Number(product.price).toFixed(2)}</p>
                <div className="d-flex gap-2">
                  <Link className="btn btn-outline-secondary w-50 rounded-pill" to={`/products/${product._id}`}>
                    Details
                  </Link>
                  <button className="btn btn-primary w-50 rounded-pill" onClick={() => addToCart(product)}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
