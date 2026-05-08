'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get('token')
  const email  = params.get('email')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6)  return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, password })  // backend only needs token + password, not email
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="animate-fade-in text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
          Password updated!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Redirecting you to login…
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to login
      </Link>

      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        New password
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Choose a strong password for your account.
      </p>

      {!token && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          Invalid or expired reset link. Please request a new one.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : 'Update password'
          }
        </button>
      </form>
    </div>
  )
}