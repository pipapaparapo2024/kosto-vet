import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCustomerMe,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  refreshCustomerSession,
  updateCustomerMe,
  fetchAndStoreCsrf,
} from '../lib/api/auth'
import { ApiError, clearCsrfToken } from '../lib/apiClient'
import { formatFieldErrors } from '../lib/payment'

const AuthContext = createContext(null)

function toAuthError(e, fallback) {
  const message = e.message || fallback
  const fields = formatFieldErrors(e instanceof ApiError ? e.fieldErrors : null)
  return fields ? `${message}. ${fields}` : message
}

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applySession = (data) => {
    const c = data?.customer ?? (data?.id ? data : null)
    setCustomer(c)
    return c
  }

  const refreshSession = useCallback(async () => {
    try {
      const data = await getCustomerMe()
      await fetchAndStoreCsrf()
      return applySession(data)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        try {
          await fetchAndStoreCsrf()
          const refreshed = await refreshCustomerSession()
          return applySession(refreshed)
        } catch {
          setCustomer(null)
          return null
        }
      }
      setCustomer(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refreshSession()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [refreshSession])

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    setLoading(true)
    try {
      const data = await loginCustomer({ email, password })
      applySession(data)
      await fetchAndStoreCsrf()
      return { ok: true }
    } catch (e) {
      const message = toAuthError(e, 'Ошибка входа')
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    setLoading(true)
    try {
      const data = await registerCustomer(payload)
      applySession(data)
      await fetchAndStoreCsrf()
      return { ok: true }
    } catch (e) {
      const message = toAuthError(e, 'Ошибка регистрации')
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    try {
      await logoutCustomer()
    } catch {
      // clear local session anyway
    }
    clearCsrfToken()
    setCustomer(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    setError(null)
    try {
      const data = await updateCustomerMe(payload)
      const c = applySession(data)
      return { ok: true, customer: c }
    } catch (e) {
      const message = toAuthError(e, 'Не удалось обновить профиль')
      setError(message)
      return { ok: false, error: message }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        customer,
        user: customer,
        loading,
        error,
        setError,
        isAuth: !!customer,
        login,
        register,
        logout,
        refreshSession,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
