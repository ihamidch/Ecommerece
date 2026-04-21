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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname
      if (!path.startsWith('/auth')) {
        localStorage.removeItem('token')
        window.dispatchEvent(new CustomEvent('ecommerce:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export default api
