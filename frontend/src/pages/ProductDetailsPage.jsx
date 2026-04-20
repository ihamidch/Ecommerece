import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'

function ProductDetailsPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`)
        setProduct(data)
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to fetch product')
      }
    }

    fetchProduct()
  }, [id])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!product) return <p>Loading product...</p>

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <img
          className="img-fluid rounded shadow-sm"
          src={getProductImage(product)}
          alt={product.name}
        />
      </div>
      <div className="col-md-6">
        <h1 className="h3">{product.name}</h1>
        <p className="text-muted">{product.category}</p>
        <p>{product.description}</p>
        <p className="fw-bold fs-4">${Number(product.price).toFixed(2)}</p>
        <p>Stock: {product.stock}</p>

        <div className="d-flex align-items-center gap-2 my-3">
          <label htmlFor="qty" className="form-label mb-0">
            Quantity
          </label>
          <input
            id="qty"
            type="number"
            min="1"
            max={product.stock || 10}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="form-control w-auto"
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => addToCart(product, quantity)}>
            Add to cart
          </button>
          <Link to="/cart" className="btn btn-outline-secondary">
            View cart
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
