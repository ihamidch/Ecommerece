/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [loading, setLoading] = useState(true)

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    if (nextToken) {
      localStorage.setItem('token', nextToken)
    } else {
      localStorage.removeItem('token')
    }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      setSession('', null)
    }
    window.addEventListener('ecommerce:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ecommerce:unauthorized', onUnauthorized)
  }, [setSession])

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch {
        setSession('', null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token, setSession])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setSession(data.token, data.user)
    return data.user
  }

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload)
    setSession(data.token, data.user)
    return data.user
  }

  const logout = () => {
    setSession('', null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
