import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, getStoredToken, setStoredToken } from '../api/client.js'

const AuthContext = createContext(null)

function extractErrorMessage(err, fallback) {
  return err?.response?.data?.detail || fallback
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `checkingSession` covers the brief window where we're validating a token
  // that's already in localStorage — avoids flashing the login page for
  // users who are actually already signed in.
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setCheckingSession(false)
      return
    }
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setStoredToken(null))
      .finally(() => setCheckingSession(false))
  }, [])

  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await authApi.signup(name, email, password)
      setStoredToken(res.data.access_token)
      setUser(res.data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: extractErrorMessage(err, 'Could not create your account.') }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login(email, password)
      setStoredToken(res.data.access_token)
      setUser(res.data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: extractErrorMessage(err, 'Could not log you in.') }
    }
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, checkingSession, signup, login, logout }),
    [user, checkingSession, signup, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
