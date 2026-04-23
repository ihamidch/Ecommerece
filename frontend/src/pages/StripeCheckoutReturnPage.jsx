import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import { useCart } from '../context/CartContext'

function StripeCheckoutReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      toast.error('Missing payment session')
      navigate('/checkout', { replace: true })
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.post('/orders/stripe/complete', { sessionId })
        if (cancelled) return
        clearCart()
        navigate(`/order-success/${data._id}`, { replace: true, state: { order: data } })
      } catch (error) {
        if (cancelled) return
        toast.error(error.response?.data?.message || 'Could not confirm payment')
        navigate('/checkout', { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, navigate, clearCart])

  return (
    <div className="surface-card mx-auto max-w-lg p-10 text-center">
      <p className="text-sm font-medium text-slate-700">Confirming your payment…</p>
      <p className="mt-2 text-xs text-slate-500">Please wait while we finalize your order.</p>
    </div>
  )
}

export default StripeCheckoutReturnPage
