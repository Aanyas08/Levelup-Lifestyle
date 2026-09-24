import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_STORAGE_KEY = 'levelup:token'

// Default timeout is generous but not infinite. The quote endpoint can be
// slower on cache-miss days (it calls Gemini) so it gets its own override
// below rather than a blanket high timeout for everything.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const authApi = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const quoteApi = {
  today: () => api.get('/quote/today', { timeout: 15_000 }), // may hit Gemini on cache miss
}

export default api
