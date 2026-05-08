'use client'

import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { Tooltip } from '@/components/ui/Tooltip'

export default function PresenceIndicator({ userId, className = '' }) {
  const [online, setOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)

  useEffect(() => {
    if (!userId) return
    const socket = getSocket()

    // Request current presence state
    socket.emit('presence:get', userId)

    // Listen for presence updates
    const handlePresence = (data) => {
      if (data.userId === userId) {
        setOnline(data.online)
        if (!data.online && data.lastSeen) {
          setLastSeen(new Date(data.lastSeen))
        }
      }
    }

    // Listen for user coming online
    const handleOnline = (data) => {
      if (data.userId === userId) {
        setOnline(true)
        setLastSeen(null)
      }
    }

    // Listen for user going offline
    const handleOffline = (data) => {
      if (data.userId === userId) {
        setOnline(false)
        setLastSeen(new Date())
      }
    }

    socket.on('presence:state',   handlePresence)
    socket.on('presence:online',  handleOnline)
    socket.on('presence:offline', handleOffline)

    return () => {
      socket.off('presence:state',   handlePresence)
      socket.off('presence:online',  handleOnline)
      socket.off('presence:offline', handleOffline)
    }
  }, [userId])

  const getTooltipText = () => {
    if (online) return 'Online now'
    if (!lastSeen) return 'Offline'
    const diff = Math.floor((Date.now() - lastSeen.getTime()) / 60000)
    if (diff < 1)  return 'Last seen just now'
    if (diff < 60) return `Last seen ${diff}m ago`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `Last seen ${hours}h ago`
    return `Last seen ${Math.floor(hours / 24)}d ago`
  }

  return (
    <Tooltip content={getTooltipText()} side="top">
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-surface-900 flex-shrink-0 transition-colors duration-300 ${
          online
            ? 'bg-emerald-500'
            : 'bg-gray-300 dark:bg-gray-600'
        } ${className}`}
      >
        {/* Ping animation when online */}
        {online && (
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
      </span>
    </Tooltip>
  )
}