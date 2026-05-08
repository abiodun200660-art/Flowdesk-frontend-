'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TwoFactorForm from '@/components/auth/TwoFactorForm'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // 2FA gate — set when backend returns twoFactorRequired: true
  const [needs2FA, setNeeds2FA] = useState(false)
  const [userId, setUserId]     = useState('')

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!form.email.trim()) { setError('Email address is required.'); return }
    if (!form.password)     { setError('Password is required.');       return }

    setLoading(true)
    setError('')

    try {
      // AuthContext login → POST /api/auth/login { email, password }
      // Returns: { user } on success  OR  { twoFactorRequired: true, userId } if 2FA enabled
      const data = await login(form.email.trim(), form.password)

      if (data.twoFactorRequired) {
        // Hand off to TwoFactorForm — pass userId so it can call /api/auth/2fa/login-verify
        setUserId(data.userId)
        setNeeds2FA(true)
      } else {
        toast.success('Welcome back! 👋')
        router.push('/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
      // Rate limit
      if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`
  }

  // ── 2FA screen ─────────────────────────────────────────────────────────────
  if (needs2FA) {
    return (
      <TwoFactorForm
        userId={userId}
        onBack={() => {
          setNeeds2FA(false)
          setUserId('')
          setForm({ email: '', password: '' })
          setError('')
        }}
        onSuccess={() => {
          toast.success('Welcome back! 👋')
          router.push('/dashboard')
        }}
      />
    )
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* Heading */}
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Sign in
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-brand-500 hover:text-brand-600 hover:underline font-semibold transition-colors"
        >
          Sign up free
        </Link>
      </p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={googleLogin}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all mb-6 shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
          <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
          <path d="M4.5 10.48A4.8 4.8 0 014.5 9a4.8 4.8 0 01.3-1.48V5.45H1.83a8 8 0 000 7.1l2.67-2.07z" fill="#FBBC05"/>
          <path d="M8.98 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.59A8 8 0 001.83 5.45L4.5 7.52a4.77 4.77 0 014.48-3.94z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-5 animate-slide-up">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4" noValidate>

        {/* Email */}
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
              value={form.email}
              onChange={handleChange('email')}
              className={`input pl-9 ${
                error && !form.email
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : ''
              }`}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-500 hover:text-brand-600 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange('password')}
              className={`input pl-9 pr-10 ${
                error && !form.password
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

      </form>

      {/* Terms note */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 leading-relaxed">
        By signing in you agree to our{' '}
        <span className="text-brand-500 cursor-pointer hover:underline">Terms</span>
        {' '}and{' '}
        <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

    </div>
  )
}