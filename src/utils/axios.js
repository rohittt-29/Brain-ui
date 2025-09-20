import axios from 'axios'
import { BASE_URL } from './constant'
 // path apne project ke hisaab se adjust kar

// Axios instance with JWT interceptor
const api = axios.create({
  baseURL: `${BASE_URL}/api`,   // yaha /api add kar de agar backend endpoints /api se start hote hai
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const url = String(config.url || '')
  const isAuthRoute = /\/auth\//.test(url)

  if (!token && !isAuthRoute) {
    // Gracefully prevent non-auth requests when token is missing
    return Promise.reject({ isAuthMissing: true, message: 'Authorization token missing', config })
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api