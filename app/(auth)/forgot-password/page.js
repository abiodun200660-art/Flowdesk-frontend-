'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val)

  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email address is required.'); return }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return }

    setLoading(true)
    setError('')
    try {
      // POST /api/auth/forgot-password { email }
      // Backend always returns success (doesn't reveal if email exists)
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      setSent(true)
      startCooldown()
    } catch (err) {
      // Rate limit hit
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.')
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      startCooldown()
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before resending.')
      } else {
        setError(err.response?.data?.message || 'Failed to resend. Try again shortly.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="animate-fade-in text-center space-y-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Check your inbox
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            We sent a password reset link to
          </p>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1 break-all">
            {email}
          </p>
        </div>

        {/* Info card */}
        <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-4 text-left space-y-2">
          {[
            'The link expires in 10 minutes.',
            'Check your spam or junk folder if you don\'t see it.',
            'Only the most recent link will work.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{tip}</p>
            </div>
          ))}
        </div>

        {/* Error (resend errors) */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Resend */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className="btn-secondary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                Resending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              <>
                <Send size={14} />
                Resend email
              </>
            )}
          </button>

          <Link
            href="/login"
            className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>

        {/* Wrong email? */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => { setSent(false); setError('') }}
            className="text-brand-500 hover:underline font-medium"
          >
            Try a different one
          </button>
        </p>

      </div>
    )
  }

  // ── Request state ──────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* Back link */}
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-8 transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Back to login
      </Link>

      {/* Heading */}
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Forgot password?
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
        No worries. Enter your email and we'll send you a secure reset link. It expires in 10 minutes.
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-5 animate-slide-up">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Email input */}
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className={`input pl-9 ${error ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400' : ''}`}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={15} />
              Send reset link
            </>
          )}
        </button>

      </form>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-brand-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>

    </div>
  )
}