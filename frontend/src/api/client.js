import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
