import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function UserDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders')
        setOrders(data)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div>
      <h1 className="h3">User Dashboard</h1>
      <p className="text-muted">
        Welcome back, <strong>{user?.name}</strong>
      </p>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5">Order History</h2>
          {loading ? <p>Loading orders...</p> : null}
          {!loading && orders.length === 0 ? <p>No orders placed yet.</p> : null}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td className="text-capitalize">{order.status}</td>
                    <td className="text-capitalize">{order.paymentStatus}</td>
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

export default UserDashboardPage
