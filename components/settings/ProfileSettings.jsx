'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AvatarUpload from './AvatarUpload'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  User, Mail, Sun, Moon, Monitor,
  CheckCircle2, Loader2, AlertTriangle, Trash2
} from 'lucide-react'

// ─── Timezone list (native Intl API) ─────────────────────────────────────────
const TIMEZONES = (() => {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
  }
})()

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun  },
  { value: 'dark',  label: 'Dark',  icon: Moon },
]

// ─── Field row wrapper ────────────────────────────────────────────────────────

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, desc, children }) {
  return (
    <div className="card p-5 space-y-5">
      {(title || desc) && (
        <div className="pb-4 border-b border-surface-100 dark:border-surface-800">
          {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {desc  && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const { user, updateUser, logout } = useAuth()
  const { theme, setTheme }          = useTheme()

  // ── form state ────────────────────────────────────────────────────────────
  const [name,  setName]  = useState(user?.name  || '')
  const [email, setEmail] = useState(user?.email || '')
  const [tz,    setTz]    = useState(
    user?.preferences?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC'
  )

  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  // ── delete account ────────────────────────────────────────────────────────
  const [deleteInput,  setDeleteInput]  = useState('')
  const [deleting,     setDeleting]     = useState(false)
  const [showDelete,   setShowDelete]   = useState(false)

  // keep form in sync if user context refreshes
  useEffect(() => {
    if (user) {
      setName(user.name   || '')
      setEmail(user.email || '')
      setTz(
        user.preferences?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'UTC'
      )
    }
  }, [user])

  // ── validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!name.trim())           e.name  = 'Name is required'
    if (name.trim().length > 50) e.name = 'Name must be 50 characters or less'
    return e
  }

  // ── save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    setErrors({})
    try {
      const { data } = await api.put('/api/users/profile', {
        name: name.trim(),
        preferences: {
          ...user?.preferences,
          theme,
          timezone: tz,
        },
      })
      updateUser(data.user)
      flashSaved()
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── theme change (instant, then saved with profile) ───────────────────────
  const handleTheme = async (val) => {
    setTheme(val)
    try {
      await api.put('/api/users/profile', {
        preferences: { ...user?.preferences, theme: val },
      })
      updateUser({ preferences: { ...user?.preferences, theme: val } })
    } catch { /* silent — ThemeContext already applied it locally */ }
  }

  // ── delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email) return
    setDeleting(true)
    try {
      await api.delete('/api/users/account')
      toast.success('Account deleted')
      logout()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isDirty = name !== (user?.name || '') || tz !== (user?.preferences?.timezone || '')

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your personal information and appearance.
          </p>
        </div>

        {/* Saved indicator */}
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 size={13} /> Saved
          </span>
        )}
      </div>

      {/* ── Avatar ── */}
      <SectionCard title="Photo" desc="Your profile photo is shown across FlowDesk.">
        <AvatarUpload size={72} />
      </SectionCard>

      {/* ── Basic info ── */}
      <SectionCard title="Basic information" desc="Update your display name. Email cannot be changed.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Name */}
          <Field label="Full name" error={errors.name}>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                maxLength={50}
                placeholder="Jane Smith"
                className={`input w-full pl-9 ${errors.name ? 'border-red-400 focus:ring-red-400/30' : ''}`}
              />
            </div>
            <p className="text-[11px] text-gray-400 text-right">{name.length}/50</p>
          </Field>

          {/* Email — read only */}
          <Field label="Email address" hint="Contact support to change your email.">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={email}
                readOnly
                disabled
                className="input w-full pl-9 opacity-60 cursor-not-allowed select-none"
              />
            </div>
          </Field>

          {/* Timezone */}
          <Field
            label="Timezone"
            hint="Used for due date reminders and digest scheduling."
            className="sm:col-span-2"
          >
            <select
              value={tz}
              onChange={e => setTz(e.target.value)}
              className="input w-full"
            >
              {TIMEZONES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : 'Save changes'
            }
          </button>
        </div>
      </SectionCard>

      {/* ── Appearance ── */}
      <SectionCard title="Appearance" desc="Choose how FlowDesk looks to you.">
        <div className="flex gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => handleTheme(value)}
                className={`flex-1 flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border-2 transition-all
                  ${active
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                  ${active
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400'
                  }`}>
                  <Icon size={17} />
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {label}
                </span>
                {active && (
                  <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Account info ── */}
      <SectionCard title="Account details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
            { label: 'Account type', value: user?.googleId ? 'Google OAuth' : 'Email & password' },
            { label: 'Role',         value: user?.role === 'admin' ? 'Administrator' : 'Member' },
            { label: 'Verified',     value: user?.isVerified ? 'Yes' : 'No' },
            { label: '2FA',          value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Danger zone ── */}
      <div className="card p-5 border border-red-200 dark:border-red-900/50 space-y-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Delete account</h3>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
        </div>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400
              border border-red-200 dark:border-red-900 rounded-xl
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={13} />
            Delete my account
          </button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Type your email <span className="font-mono font-bold text-red-600 dark:text-red-400">{user?.email}</span> to confirm
              </label>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={user?.email}
                className="input w-full text-sm border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400/30"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== user?.email || deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500
                  hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting
                  ? <><Loader2 size={13} className="animate-spin" /> Deleting…</>
                  : <><Trash2 size={13} /> Delete permanently</>
                }
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteInput('') }}
                disabled={deleting}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}