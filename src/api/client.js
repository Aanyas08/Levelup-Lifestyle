import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-lifestyle.onrender.com'

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

export const wellnessApi = {
  today: () => api.get('/wellness/today'),
  saveToday: (patch) => api.put('/wellness/today', patch),
  history: (days = 14) => api.get('/wellness/history', { params: { days } }),
}

export const medicationsApi = {
  list: () => api.get('/medications'),
  create: (payload) => api.post('/medications', payload),
  update: (id, payload) => api.put(`/medications/${id}`, payload),
  remove: (id) => api.delete(`/medications/${id}`),
  today: () => api.get('/medications/schedule/today'),
  logDose: (payload) => api.post('/medications/log', payload),
  history: (params) => api.get('/medications/history/all', { params }),
  adherence: (period = 'week') => api.get('/medications/adherence/summary', { params: { period } }),
}

export const gameApi = {
  getState: () => api.get('/game/state'),
  saveState: (state) => api.put('/game/state', { state }),
}

export const aiApi = {
  dailyInsight: () => api.get('/ai/daily-insight', { timeout: 15_000 }), // may hit Gemini on cache miss
}
export default api