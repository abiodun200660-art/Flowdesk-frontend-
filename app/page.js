'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

export default function Error({ error, reset }) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [countdown, setCountdown]     = useState(0)
  const isDev = process.env.NODE_ENV === 'development'

  // Log to console in development
  useEffect(() => {
    if (isDev) {
      console.error('[FlowDesk Error Boundary]', error)
    }
  }, [error, isDev])

  // Auto-retry countdown (only show if reset is available)
  useEffect(() => {
    if (!reset) return
    setCountdown(10)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [reset])

  const errorMessage = error?.message || 'An unexpected error occurred.'
  const errorDigest  = error?.digest  || null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-sm">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-display text-xl font-bold text-gray-900 dark:text-white">
          FlowDesk
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-3xl shadow-modal dark:shadow-modal-dark p-8 text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
          {errorMessage}
        </p>

        {/* Error digest (Next.js server error ID) */}
        {errorDigest && (
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl px-4 py-2.5 mb-6 inline-block">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              Error ID: <span className="text-gray-600 dark:text-gray-300 font-semibold">{errorDigest}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {reset && (
            <button
              onClick={reset}
              className="btn-primary w-full py-3"
            >
              <RefreshCw size={15} />
              {countdown > 0 ? `Try again (${countdown}s)` : 'Try again'}
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="btn-ghost w-full py-3"
          >
            Go back
          </button>

          <Link href="/dashboard" className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
            <Home size={15} />
            Back to Dashboard
          </Link>
        </div>

        {/* Dev: stack trace toggle */}
        {isDev && error?.stack && (
          <div className="mt-6 text-left">
            <button
              onClick={() => setShowDetails((p) => !p)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-full"
            >
              {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showDetails ? 'Hide' : 'Show'} stack trace (dev only)
            </button>
            {showDetails && (
              <pre className="mt-3 p-4 bg-surface-900 dark:bg-black rounded-xl text-[10px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {error.stack}
              </pre>
            )}
          </div>
        )}

      </div>

      {/* Help note */}
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-8 text-center">
        If this keeps happening,{' '}
        <span className="text-brand-500 hover:underline cursor-pointer">
          contact support
        </span>
        {errorDigest && (
          <> and mention error ID <span className="font-mono font-semibold">{errorDigest}</span></>
        )}
        .
      </p>

    </div>
  )
}