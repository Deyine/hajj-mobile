import axios from 'axios'
import { getAccessToken, clearAuthData } from '../utils/auth'
import { getImpersonatedNNI } from '../utils/debug'

/**
 * Axios instance configured for API calls
 * Automatically injects Bearer token and handles 401 responses
 * No baseURL needed - Vite proxy handles /api routing
 */
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - inject access token and debug headers
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add debug impersonation header if impersonating
    const impersonatedNNI = getImpersonatedNNI()
    if (impersonatedNNI) {
      config.headers['X-Debug-Impersonate-NNI'] = impersonatedNNI
      console.log('[DEBUG] Sending request with impersonated NNI:', impersonatedNNI)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 unauthorized
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data and redirect to login
      clearAuthData()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
