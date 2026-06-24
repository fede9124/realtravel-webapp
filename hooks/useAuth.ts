'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const STORAGE_KEY = 'rt-auth'

interface AuthState {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
})

export function useAuthProvider(): AuthState {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    try {
      setIsLoggedIn(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {}
  }, [])

  const login = useCallback(() => {
    setIsLoggedIn(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { isLoggedIn, login, logout }
}

export { AuthContext }

export function useAuth() {
  return useContext(AuthContext)
}
