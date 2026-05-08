'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6)           score++
  if (pw.length >= 10)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-400'    }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-yellow-400' }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-blue-400'   }
  return              { score, label: 'Strong', color: 'bg-green-400'  }
}

export default function RegisterPage() {
  const { register } = useAuth()
  const router       = useRouter()

  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState({})

  const strength = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.name.trim())                     e.name     = 'Full name is required.'
    if (!form.email.trim())                    e.email    = 'Email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email address.'
    if (!form.password)                        e.password = 'Password is required.'
    else if (form.password.length < 6)         e.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirm)        e.confirm  = 'Passwords do not match.'
    return e
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return }
    setLoading(true)
    setErrors({})
    try {
      // AuthContext register → POST /api/auth/register { name, email, password }
      // Backend creates user + default workspace, sets cookie, returns { user }
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Welcome to FlowDesk! 🎉')
      router.push('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg })
      } else if (err.response?.status === 429) {
        setErrors({ submit: 'Too many attempts. Please wait a moment and try again.' })
      } else {
        setErrors({ submit: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  const googleRegister = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`
  }

  return (
    <div className="animate-fade-in">

      {/* Heading */}
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Create account
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Already have one?{' '}
        <Link
          href="/login"
          className="text-brand-500 hover:text-brand-600 hover:underline font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={googleRegister}
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

      {/* Global submit error */}
      {errors.submit && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-5 animate-slide-up">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Full name */}
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange('name')}
              className={`input pl-9 ${
                errors.name
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : ''
              }`}
            />
          </div>
          {errors.name && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={11} /> {errors.name}
            </p>
          )}
        </div>

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
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              className={`input pl-9 ${
                errors.email
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : ''
              }`}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={11} /> {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange('password')}
              className={`input pl-9 pr-10 ${
                errors.password
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength meter */}
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.score
                        ? strength.color
                        : 'bg-surface-200 dark:bg-surface-700'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.score <= 1 ? 'text-red-400' :
                strength.score <= 2 ? 'text-yellow-500' :
                strength.score <= 3 ? 'text-blue-500' :
                'text-green-500'
              }`}>
                {strength.label} password
              </p>
            </div>
          )}

          {errors.password && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={11} /> {errors.password}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="label">Confirm password</label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange('confirm')}
              className={`input pl-9 pr-10 ${
                errors.confirm
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-400'
                  : form.confirm && form.confirm === form.password
                  ? 'border-green-400 dark:border-green-600 focus:ring-green-500/20'
                  : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {form.confirm && form.confirm === form.password && (
                <CheckCircle2 size={14} className="text-green-500" />
              )}
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                tabIndex={-1}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {errors.confirm && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={11} /> {errors.confirm}
            </p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          By creating an account you agree to our{' '}
          <span className="text-brand-500 cursor-pointer hover:underline">
            Terms of Service
          </span>
          {' '}and{' '}
          <span className="text-brand-500 cursor-pointer hover:underline">
            Privacy Policy
          </span>.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

      </form>
    </div>
  )
}