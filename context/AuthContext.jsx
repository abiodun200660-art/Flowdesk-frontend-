'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { connectSocket, disconnectSocket } from '@/lib/socket'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data.user)
      connectSocket(data.user._id)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    // Backend sends twoFactorRequired (not requires2FA)
    if (!data.twoFactorRequired) {
      setUser(data.user)
      connectSocket(data.user._id)
    }
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    setUser(data.user)
    connectSocket(data.user._id)
    return data
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {}
    disconnectSocket()
    setUser(null)
  }

  const updateUser = (updates) =>
    setUser((prev) => ({ ...prev, ...updates }))

  // tempToken is actually the userId returned by the login response
  const verify2FA = async (token, userId) => {
    const { data } = await api.post('/api/auth/2fa/login-verify', { token, userId })
    setUser(data.user)
    connectSocket(data.user._id)
    return data
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, verify2FA, refetch: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}