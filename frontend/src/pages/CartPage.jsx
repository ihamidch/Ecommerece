import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../utils/productImage'

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="text-center">
        <h1 className="h3">Your cart is empty</h1>
        <Link to="/" className="btn btn-primary mt-3">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">Cart</h1>
        <div className="list-group">
          {cartItems.map((item, index) => (
            <div key={item.productId} className="list-group-item">
              <div className="d-flex gap-3 align-items-center">
                <img
                  src={getProductImage(item, index)}
                  alt={item.name}
                  className="cart-thumb"
                />
                <div className="flex-grow-1">
                  <h2 className="h6 mb-1">{item.name}</h2>
                  <p className="mb-2">${Number(item.price).toFixed(2)}</p>
                  <div className="d-flex align-items-center gap-2">
                    <label className="small">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.productId, Number(event.target.value))
                      }
                      className="form-control form-control-sm w-auto"
                    />
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5">Order Summary</h2>
            <p className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <button className="btn btn-primary w-100" onClick={() => navigate('/checkout')}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
