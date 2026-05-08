'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Lock, Shield, ShieldCheck, ShieldOff, Eye, EyeOff,
  Smartphone, Key, CheckCircle2, AlertTriangle,
  Loader2, Copy, Check, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PasswordInput({ label, value, onChange, error, placeholder, hint, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
          autoComplete={autoComplete}
          className={`input w-full pl-9 pr-10 ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ── Password strength meter ────────────────────────────────────────────────────
function StrengthMeter({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter',       pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',       pass: /[a-z]/.test(password) },
    { label: 'Number',                 pass: /\d/.test(password) },
    { label: 'Special character',      pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']
  const textColors = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-600']

  if (!password) return null

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-surface-200 dark:bg-surface-700'
            }`}
          />
        ))}
      </div>
      {/* Label + checks */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map(c => (
            <span key={c.label} className={`text-[11px] flex items-center gap-1 ${c.pass ? 'text-emerald-500' : 'text-gray-400'}`}>
              <CheckCircle2 size={10} className={c.pass ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${textColors[score]}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  )
}

// ── 2FA Setup flow ─────────────────────────────────────────────────────────────
function TwoFASetup({ onDone, onCancel }) {
  const [step,    setStep]    = useState('loading') // loading | scan | verify
  const [qrCode,  setQrCode]  = useState('')
  const [secret,  setSecret]  = useState('')
  const [token,   setToken]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [copied,  setCopied]  = useState(false)

  const initSetup = async () => {
    setStep('loading')
    try {
      const { data } = await api.post('/api/auth/2fa/setup')
      // backend returns: { qrCode (data-url), secret (base32) }
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('scan')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize 2FA')
      onCancel()
    }
  }

  // auto-init on mount
  useState(() => { initSetup() }, [])

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error('Copy failed') }
  }

  const handleVerify = async () => {
    if (token.length !== 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/2fa/verify-setup', { token })
      toast.success('Two-factor authentication enabled!')
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code — try again')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={22} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Scan QR code', 'Enter code'].map((label, i) => {
          const active  = (i === 0 && step === 'scan') || (i === 1 && step === 'verify')
          const done    = i === 0 && step === 'verify'
          return (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-colors
                ${done   ? 'bg-emerald-500 text-white' :
                  active ? 'bg-brand-500 text-white' :
                           'bg-surface-200 dark:bg-surface-700 text-gray-400'}`}>
                {done ? <Check size={10} /> : i + 1}
              </span>
              <span className={`text-xs ${active ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {i === 0 && <span className="text-gray-300 dark:text-gray-600 mx-1">→</span>}
            </div>
          )
        })}
      </div>

      {step === 'scan' && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Open <strong className="text-gray-900 dark:text-white">Google Authenticator</strong>,{' '}
            <strong className="text-gray-900 dark:text-white">Authy</strong>, or any TOTP app and scan the QR code below.
          </p>

          {/* QR code */}
          <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
            {qrCode
              ? <img src={qrCode} alt="2FA QR code" className="w-44 h-44 rounded-lg" />
              : <div className="w-44 h-44 bg-surface-100 dark:bg-surface-700 rounded-lg animate-pulse" />
            }
            <div className="text-center w-full">
              <p className="text-xs text-gray-400 mb-1.5">Or enter this key manually:</p>
              <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-750 rounded-lg px-3 py-2 border border-surface-200 dark:border-surface-700">
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 break-all select-all">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="flex-shrink-0 text-gray-400 hover:text-brand-500 transition-colors"
                  title="Copy secret"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('verify')} className="btn-primary flex-1">
              I've scanned it — next
            </button>
            <button onClick={onCancel} className="btn-ghost">Cancel</button>
          </div>
        </>
      )}

      {step === 'verify' && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code currently shown in your authenticator app to confirm setup.
          </p>

          <div className="space-y-1.5">
            <label className="label">Verification code</label>
            <input
              autoFocus
              value={token}
              onChange={e => { setToken(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              maxLength={6}
              placeholder="123456"
              className={`input w-full text-center text-xl font-mono tracking-[0.4em] ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={loading || token.length !== 6}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {loading ? 'Verifying…' : 'Activate 2FA'}
            </button>
            <button onClick={() => setStep('scan')} className="btn-ghost">Back</button>
          </div>
        </>
      )}
    </div>
  )
}

// ── 2FA Disable flow ──────────────────────────────────────────────────────────
function TwoFADisable({ onDone, onCancel }) {
  const [token,   setToken]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleDisable = async () => {
    if (token.length !== 6) { setError('Enter your current 6-digit code'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/2fa/disable', { token })
      toast.success('Two-factor authentication disabled')
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Your account will be less secure without 2FA. Enter your current authenticator code to confirm.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="label">Current 2FA code</label>
        <input
          autoFocus
          value={token}
          onChange={e => { setToken(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleDisable()}
          maxLength={6}
          placeholder="123456"
          className={`input w-full text-center text-xl font-mono tracking-[0.4em] ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDisable}
          disabled={loading || token.length !== 6}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
          {loading ? 'Disabling…' : 'Disable 2FA'}
        </button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SecuritySettings() {
  const { user, updateUser } = useAuth()

  // ── password change ───────────────────────────────────────────────────────
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdSaved,  setPwdSaved]  = useState(false)

  // ── 2FA ───────────────────────────────────────────────────────────────────
  const [twoFAMode, setTwoFAMode] = useState('idle') // idle | setup | disable

  const setPwd_ = (k, v) => {
    setPwd(p => ({ ...p, [k]: v }))
    setPwdErrors(e => ({ ...e, [k]: '' }))
  }

  const validatePassword = () => {
    const e = {}
    if (!pwd.current)           e.current = 'Current password is required'
    if (!pwd.next)              e.next    = 'New password is required'
    if (pwd.next.length < 6)   e.next    = 'At least 6 characters required'
    if (pwd.next !== pwd.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handlePasswordChange = async () => {
    const e = validatePassword()
    if (Object.keys(e).length) { setPwdErrors(e); return }

    setSavingPwd(true)
    try {
      await api.put('/api/users/password', {
        currentPassword: pwd.current,
        newPassword:     pwd.next,
      })
      setPwd({ current: '', next: '', confirm: '' })
      setPwdSaved(true)
      setTimeout(() => setPwdSaved(false), 3000)
      toast.success('Password updated')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password'
      if (msg.toLowerCase().includes('current') || msg.toLowerCase().includes('incorrect')) {
        setPwdErrors({ current: msg })
      } else {
        toast.error(msg)
      }
    } finally {
      setSavingPwd(false)
    }
  }

  const isGoogleAccount = !!user?.googleId

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Security</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your password and two-factor authentication.
        </p>
      </div>

      {/* ── Password ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Password</h3>
          </div>
          {pwdSaved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <CheckCircle2 size={12} /> Updated
            </span>
          )}
        </div>

        {isGoogleAccount ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your account uses <strong>Google OAuth</strong>. Password management is handled by Google.
            </p>
          </div>
        ) : (
          <>
            <PasswordInput
              label="Current password"
              value={pwd.current}
              onChange={e => setPwd_('current', e.target.value)}
              error={pwdErrors.current}
              autoComplete="current-password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <PasswordInput
                  label="New password"
                  value={pwd.next}
                  onChange={e => setPwd_('next', e.target.value)}
                  error={pwdErrors.next}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <StrengthMeter password={pwd.next} />
              </div>

              <PasswordInput
                label="Confirm new password"
                value={pwd.confirm}
                onChange={e => setPwd_('confirm', e.target.value)}
                error={pwdErrors.confirm}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={savingPwd || !pwd.current || !pwd.next || !pwd.confirm}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPwd
                  ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                  : <><Lock size={14} /> Update password</>
                }
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Two-factor authentication ── */}
      <div className="card p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={15} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Two-factor authentication</h3>
          </div>

          {/* Status badge */}
          {user?.twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={11} /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400">
              <ShieldOff size={11} /> Disabled
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Add a second layer of security using a TOTP authenticator app like{' '}
          <span className="text-gray-700 dark:text-gray-300 font-medium">Google Authenticator</span> or{' '}
          <span className="text-gray-700 dark:text-gray-300 font-medium">Authy</span>.
          You'll be asked for a code each time you sign in.
        </p>

        {/* Idle state */}
        {twoFAMode === 'idle' && (
          <div className="flex gap-2">
            {user?.twoFactorEnabled ? (
              <>
                <button
                  onClick={() => setTwoFAMode('disable')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <ShieldOff size={14} /> Disable 2FA
                </button>
                <button
                  onClick={() => setTwoFAMode('setup')}
                  className="btn-ghost flex items-center gap-1.5 text-sm"
                >
                  <RefreshCw size={13} /> Regenerate
                </button>
              </>
            ) : (
              <button
                onClick={() => setTwoFAMode('setup')}
                className="btn-primary flex items-center gap-1.5"
              >
                <Shield size={14} /> Enable 2FA
              </button>
            )}
          </div>
        )}

        {/* Setup flow */}
        {twoFAMode === 'setup' && (
          <TwoFASetup
            onDone={() => {
              updateUser({ twoFactorEnabled: true })
              setTwoFAMode('idle')
            }}
            onCancel={() => setTwoFAMode('idle')}
          />
        )}

        {/* Disable flow */}
        {twoFAMode === 'disable' && (
          <TwoFADisable
            onDone={() => {
              updateUser({ twoFactorEnabled: false })
              setTwoFAMode('idle')
            }}
            onCancel={() => setTwoFAMode('idle')}
          />
        )}
      </div>

      {/* ── Security tips ── */}
      <div className="card p-4 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30">
        <div className="flex items-start gap-2.5">
          <Shield size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">Security tips</p>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 list-disc list-inside">
              <li>Use a unique password you don't use on other sites</li>
              <li>Enable 2FA for the strongest account protection</li>
              <li>Never share your password or 2FA codes with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}