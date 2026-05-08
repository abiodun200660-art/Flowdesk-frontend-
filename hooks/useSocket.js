import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'

export default function useSocket(eventMap = {}) {
  useEffect(() => {
    const socket  = getSocket()
    const entries = Object.entries(eventMap)
    entries.forEach(([event, handler]) => socket.on(event, handler))
    return () => {
      entries.forEach(([event, handler]) => socket.off(event, handler))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}