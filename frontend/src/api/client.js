import axios from 'axios'

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim()
const baseURL = envApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

if (import.meta.env.PROD && !envApiUrl) {
  // In production this should always be configured to the deployed backend URL.
  // Fallback to /api keeps reverse-proxy deployments functional.
  console.warn('VITE_API_URL is not set. Falling back to relative /api path.')
}

const api = axios.create({
  baseURL,
})

const refreshClient = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const refreshToken = localStorage.getItem('refreshToken')
    const isAuthRefreshRequest = originalRequest.url?.includes('/auth/refresh')
    const isAuthLoginRequest = originalRequest.url?.includes('/auth/login')
    const isAuthSignupRequest = originalRequest.url?.includes('/auth/signup')

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry &&
      !isAuthRefreshRequest &&
      !isAuthLoginRequest &&
      !isAuthSignupRequest
    ) {
      originalRequest._retry = true
      try {
        const { data } = await refreshClient.post('/auth/refresh', { refreshToken })
        if (data?.token) {
          localStorage.setItem('token', data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        }
      } catch {
        // Fall through to global unauthorized handler.
      }
    }

    if (error.response?.status === 401) {
      const path = window.location.pathname
      if (!path.startsWith('/auth')) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.dispatchEvent(new CustomEvent('ecommerce:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export default api
