import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'kv_token'
const USER_KEY = 'kv_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Проверяем сессию при старте
  useEffect(() => {
    if (token && !user) fetchMe(token)
  }, [])

  const fetchMe = async (t) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      saveUser(data, t)
    } catch {
      logout()
    }
  }

  const saveUser = (userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    localStorage.setItem(TOKEN_KEY, jwt)
  }

  // Вызывается со страницы /auth/callback после получения code от Яндекса
  const loginWithCode = useCallback(async (code) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/yandex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) throw new Error('Ошибка авторизации')
      const { token: jwt, user: userData } = await res.json()
      saveUser(userData, jwt)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, error, loginWithCode, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
