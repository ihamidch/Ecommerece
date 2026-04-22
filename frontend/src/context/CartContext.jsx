/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import api from '../api/client'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  })
  const [isCartReady, setIsCartReady] = useState(false)
  const [isSyncingCart, setIsSyncingCart] = useState(false)
  const didHydrateFromServer = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration flag for cart skeleton state
    setIsCartReady(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      didHydrateFromServer.current = true
      return
    }

    let ignore = false
    const hydrateCart = async () => {
      try {
        setIsSyncingCart(true)
        const { data } = await api.get('/users/me/cart')
        if (!ignore && Array.isArray(data?.items)) {
          setCartItems(data.items)
        }
      } catch {
        // If cart sync fails, keep local cart as fallback.
      } finally {
        didHydrateFromServer.current = true
        if (!ignore) setIsSyncingCart(false)
      }
    }

    hydrateCart()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !didHydrateFromServer.current) return

    const timeoutId = setTimeout(() => {
      api.put('/users/me/cart', { items: cartItems }).catch(() => {})
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product._id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        },
      ]
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const clearCart = () => setCartItems([])

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return {
      count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    }
  }, [cartItems])

  const value = {
    cartItems,
    isCartReady,
    isSyncingCart,
    ...totals,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
