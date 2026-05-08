'use client'

import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

/**
 * TwoFactorForm
 *
 * Props:
 *  - userId    {string}   — returned by backend when twoFactorRequired: true
 *  - onBack    {function} — called when user clicks "Back to login"
 *  - onSuccess {function} — called after successful verify (optional, defaults to /dashboard redirect)
 *
 * Backend: POST /api/auth/2fa/login-verify { token: string, userId: string }
 * AuthContext: verify2FA(token, userId) → sets user + connects socket
 */
export default function TwoFactorForm({ userId, onBack, onSuccess }) {
  const { verify2FA } = useAuth()
  const router = useRouter()

  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [shake, setShake]       = useState(false)
  const inputsRef               = useRef([])

  // Auto-focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const code = digits.join('')

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleChange = (index, value) => {
    // Only allow single digit
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = cleaned
    setDigits(updated)
    setError('')

    // Auto-advance to next input
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are filled
    const full = updated.join('')
    if (full.length === 6) {
      submitCode(full)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const updated = [...digits]
      if (updated[index]) {
        // Clear current
        updated[index] = ''
        setDigits(updated)
      } else if (index > 0) {
        // Move back and clear previous
        updated[index - 1] = ''
        setDigits(updated)
        inputsRef.current[index - 1]?.focus()
      }
      setError('')
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    } else if (e.key === 'Enter' && code.length === 6) {
      submitCode(code)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const updated = ['', '', '', '', '', '']
    pasted.split('').forEach((char, i) => { updated[i] = char })
    setDigits(updated)
    setError('')
    // Focus last filled or last
    const lastIndex = Math.min(pasted.length - 1, 5)
    inputsRef.current[lastIndex]?.focus()
    // Auto-submit if complete
    if (pasted.length === 6) {
      submitCode(pasted)
    }
  }

  const submitCode = async (token) => {
    if (!token || token.length < 6) {
      setError('Please enter all 6 digits.')
      triggerShake()
      return
    }
    setLoading(true)
    setError('')
    try {
      // AuthContext verify2FA → POST /api/auth/2fa/login-verify { token, userId }
      await verify2FA(token, userId)
      toast.success('Verified! Welcome back 👋')
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid code. Please try again.'
      setError(msg)
      triggerShake()
      // Clear digits on wrong code so user can retry cleanly
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitCode(code)
  }

  const handleReset = () => {
    setDigits(['', '', '', '', '', ''])
    setError('')
    setTimeout(() => inputsRef.current[0]?.focus(), 50)
  }

  return (
    <div className="animate-fade-in">

      {/* Icon + heading */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
          <ShieldCheck size={32} className="text-brand-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Two-factor auth
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
          Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-5 animate-slide-up">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* 6-digit input boxes */}
        <div
          className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`
                w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all
                bg-white dark:bg-surface-800
                text-gray-900 dark:text-white
                focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15
                disabled:opacity-50 disabled:cursor-not-allowed
                ${digit
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'border-surface-200 dark:border-surface-700'
                }
                ${error ? 'border-red-400 dark:border-red-600' : ''}
              `}
            />
          ))}
        </div>

        {/* Code progress hint */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-6">
          {code.length < 6
            ? `${6 - code.length} digit${6 - code.length !== 1 ? 's' : ''} remaining`
            : 'Submitting...'}
        </p>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="btn-primary w-full py-3 text-base mb-3"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Verify code
            </>
          )}
        </button>

        {/* Secondary actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Back */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to login
            </button>
          )}

          {/* Clear / retry */}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || digits.every((d) => !d)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 ml-auto"
          >
            <RefreshCw size={13} />
            Clear
          </button>
        </div>

      </form>

      {/* Help text */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
        Lost access to your authenticator?{' '}
        <span className="text-brand-500 hover:underline cursor-pointer">
          Contact support
        </span>
      </p>

    </div>
  )
}