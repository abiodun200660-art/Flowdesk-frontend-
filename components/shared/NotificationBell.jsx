'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { formatRelative } from '@/lib/utils'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'

export default function NotificationBell({ workspaceId }) {
  const [notifs, setNotifs]   = useState([])
  const [open, setOpen]       = useState(false)
  const ref                   = useRef(null)
  const unread                = notifs.filter(n => !n.isRead).length

  useEffect(() => {
    fetchNotifs()
  }, [])

  useEffect(() => {
    if (!workspaceId) return
    const socket = getSocket()
    const handleNew = (n) => setNotifs(prev => [n, ...prev].slice(0, 20))
    socket.on('notification:new', handleNew)   // backend emits 'notification:new' not 'notification'
    return () => socket.off('notification:new', handleNew)
  }, [workspaceId])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/api/notifications')
      setNotifs(data.notifications || [])
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const markAll = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 card shadow-modal z-50 animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
            {unread > 0 && <button onClick={markAll} className="text-xs text-brand-500 hover:text-brand-600">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">All caught up!</div>
            ) : notifs.map(n => (
              <button key={n._id} onClick={() => { markRead(n._id); setOpen(false) }}
                className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors ${!n.isRead ? 'bg-brand-500/5' : ''}`}>
                {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                <div className={!n.isRead ? '' : 'pl-3.5'}>
                  <p className="text-sm text-gray-900 dark:text-white">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
