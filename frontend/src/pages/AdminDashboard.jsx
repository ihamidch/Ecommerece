import { useEffect, useState } from 'react'
import api from '../api/client'

const initialProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image: '',
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(initialProduct)
  const [editingId, setEditingId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes] = await Promise.all([api.get('/products'), api.get('/orders')])
      setProducts(productsRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [])

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form)
        setMessage('Product updated')
      } else {
        await api.post('/products', form)
        setMessage('Product added')
      }
      setForm(initialProduct)
      setEditingId('')
      fetchData()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save product')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      fetchData()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed')
    }
  }

  const startEditing = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '',
    })
  }

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status })
    fetchData()
  }

  return (
    <div>
      <h1 className="h3">Admin Dashboard</h1>
      {message ? <div className="alert alert-info mt-3">{message}</div> : null}

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5">{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <form className="row g-3" onSubmit={handleProductSubmit}>
            {Object.keys(initialProduct).map((field) => (
              <div className="col-md-6" key={field}>
                <label className="form-label text-capitalize">{field}</label>
                <input
                  className="form-control"
                  required={field !== 'image'}
                  value={form[field]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                />
              </div>
            ))}
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary">{editingId ? 'Update' : 'Add'} Product</button>
              {editingId ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setEditingId('')
                    setForm(initialProduct)
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5">Manage Products</h2>
          {loading ? <p>Loading...</p> : null}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEditing(product)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5">Manage Orders</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Set Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td className="text-capitalize">{order.status}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
