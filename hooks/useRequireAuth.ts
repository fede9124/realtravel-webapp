'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useRequireAuth() {
  const { isLoggedIn } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [loginMessage, setLoginMessage] = useState<string | undefined>()

  const requireAuth = useCallback((message?: string): boolean => {
    if (isLoggedIn) return true
    setLoginMessage(message)
    setShowLogin(true)
    return false
  }, [isLoggedIn])

  return {
    isLoggedIn,
    showLogin,
    loginMessage,
    requireAuth,
    closeLogin: useCallback(() => setShowLogin(false), []),
  }
}
