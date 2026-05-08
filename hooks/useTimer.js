import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '@/lib/utils'

export default function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds]   = useState(initialSeconds)
  const [running, setRunning]   = useState(false)
  const startedAtRef            = useRef(null)
  const intervalRef             = useRef(null)

  useEffect(() => {
    if (running) {
      startedAtRef.current = Date.now() - seconds * 1000
      intervalRef.current  = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = () => setRunning(true)

  const stop = () => {
    setRunning(false)
    return seconds
  }

  const reset = () => {
    setRunning(false)
    setSeconds(0)
  }

  return {
    seconds,
    display: formatDuration(seconds),
    running,
    start,
    stop,
    reset,
  }
}