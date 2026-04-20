import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

const initialAddress = {
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, subtotal, clearCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('mock')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    setShippingAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (cartItems.length === 0) {
      setMessage('Your cart is empty.')
      return
    }

    try {
      setLoading(true)
      let paymentStatus = 'paid'

      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/orders/payment-intent', { amount: subtotal })
        paymentStatus = data.mode === 'mock' ? 'paid' : 'pending'
      }

      await api.post('/orders', {
        cartItems,
        shippingAddress,
        paymentMethod,
        paymentStatus,
      })

      clearCart()
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">Checkout</h1>
        {message ? <div className="alert alert-info">{message}</div> : null}
        <form className="card shadow-sm" onSubmit={handleSubmit}>
          <div className="card-body">
            <h2 className="h5">Shipping Address</h2>
            <div className="row g-3">
              {Object.keys(initialAddress).map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label text-capitalize">{field}</label>
                  <input
                    required
                    name={field}
                    className="form-control"
                    value={shippingAddress[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <h2 className="h5 mt-4">Payment</h2>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  id="mock"
                  className="form-check-input"
                  type="radio"
                  checked={paymentMethod === 'mock'}
                  onChange={() => setPaymentMethod('mock')}
                />
                <label htmlFor="mock" className="form-check-label">
                  Mock Payment
                </label>
              </div>
              <div className="form-check">
                <input
                  id="stripe"
                  className="form-check-input"
                  type="radio"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                />
                <label htmlFor="stripe" className="form-check-label">
                  Stripe
                </label>
              </div>
            </div>

            <p className="mt-3 mb-0">
              Total: <strong>${subtotal.toFixed(2)}</strong>
            </p>
          </div>
          <div className="card-footer bg-white">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
