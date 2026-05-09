'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'

export default function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    fetchNotifications()
    const socket = getSocket()
    socket.on('notification:new', handleNew)
    return () => socket.off('notification:new', handleNew)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications?limit=20')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleNew = (notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 20))
    setUnreadCount((n) => n + 1)
  }

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)   // backend uses PUT not PATCH
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((n) => Math.max(0, n - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')     // backend uses PUT not PATCH
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
  }
}