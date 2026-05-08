'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Bell, Mail, Zap, Clock, CheckCircle2,
  Users, FolderOpen, MessageSquare, Loader2,
  BellOff, Volume2, VolumeX
} from 'lucide-react'

// ─── Config — maps to User.preferences on backend ────────────────────────────

const EMAIL_SETTINGS = [
  {
    key:   'emailNotifications',
    icon:  Mail,
    label: 'Email notifications',
    desc:  'Receive activity updates and alerts via email',
    color: 'text-blue-500',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key:   'weeklyDigest',
    icon:  Clock,
    label: 'Weekly digest',
    desc:  'A summary of your workspace activity every Monday morning',
    color: 'text-violet-500',
    bg:    'bg-violet-50 dark:bg-violet-900/20',
  },
]

// In-app notification types — stored locally (browser) since backend
// doesn't model per-type preferences yet; persisted in localStorage
const INAPP_SETTINGS = [
  {
    key:   'notif_task_assigned',
    icon:  CheckCircle2,
    label: 'Task assigned to me',
    desc:  'When someone assigns a task to you',
    color: 'text-brand-500',
    bg:    'bg-brand-50 dark:bg-brand-900/20',
  },
  {
    key:   'notif_task_due',
    icon:  Clock,
    label: 'Task due reminders',
    desc:  'Reminders when your tasks are approaching their due date',
    color: 'text-amber-500',
    bg:    'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    key:   'notif_comment',
    icon:  MessageSquare,
    label: 'Comments & mentions',
    desc:  'When someone comments on your task or @mentions you',
    color: 'text-emerald-500',
    bg:    'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    key:   'notif_member_joined',
    icon:  Users,
    label: 'Member joined workspace',
    desc:  'When a new member joins your workspace',
    color: 'text-cyan-500',
    bg:    'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    key:   'notif_project_update',
    icon:  FolderOpen,
    label: 'Project updates',
    desc:  'Status changes and milestone completions on your projects',
    color: 'text-pink-500',
    bg:    'bg-pink-50 dark:bg-pink-900/20',
  },
  {
    key:   'notif_ai_summary',
    icon:  Zap,
    label: 'AI weekly summary',
    desc:  'AI-generated insights and productivity tips each week',
    color: 'text-brand-500',
    bg:    'bg-brand-50 dark:bg-brand-900/20',
  },
]

const LOCAL_KEY = 'flowdesk-notif-prefs'

function loadLocalPrefs() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveLocalPrefs(prefs) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs)) } catch {}
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ icon: Icon, label, desc, color, bg, enabled, onChange, disabled }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-xl transition-colors ${
      enabled ? 'bg-surface-50 dark:bg-surface-800/60' : 'opacity-60'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={15} className={color} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug mt-0.5 line-clamp-2">{desc}</p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        aria-checked={enabled}
        role="switch"
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed
          ${enabled ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
          ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, subtitle, icon: Icon, iconColor, children }) {
  return (
    <div className="card p-5 space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className={iconColor} />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationSettings() {
  const { user, updateUser } = useAuth()

  // Email prefs (synced to backend via PUT /api/users/profile)
  const [emailPrefs, setEmailPrefs] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    weeklyDigest:       user?.preferences?.weeklyDigest       ?? true,
  })

  // In-app prefs (local only)
  const [inAppPrefs, setInAppPrefs] = useState(() => {
    const saved = loadLocalPrefs()
    const defaults = Object.fromEntries(INAPP_SETTINGS.map(s => [s.key, true]))
    return { ...defaults, ...saved }
  })

  // Sound pref (local)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flowdesk-notif-sound') ?? 'true') } catch { return true }
  })

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // Sync email prefs from user context if it changes
  useEffect(() => {
    if (user?.preferences) {
      setEmailPrefs({
        emailNotifications: user.preferences.emailNotifications ?? true,
        weeklyDigest:       user.preferences.weeklyDigest       ?? true,
      })
    }
  }, [user?.preferences])

  // ── save email prefs to backend ───────────────────────────────────────────
  const handleEmailToggle = async (key, value) => {
    const next = { ...emailPrefs, [key]: value }
    setEmailPrefs(next)
    setSaving(true)
    try {
      const { data } = await api.put('/api/users/profile', {
        preferences: next,
      })
      updateUser({ preferences: data.user.preferences })
      flashSaved()
    } catch (err) {
      // revert on error
      setEmailPrefs(emailPrefs)
      toast.error(err.response?.data?.message || 'Failed to save preference')
    } finally {
      setSaving(false)
    }
  }

  // ── save in-app prefs to localStorage ────────────────────────────────────
  const handleInAppToggle = (key, value) => {
    const next = { ...inAppPrefs, [key]: value }
    setInAppPrefs(next)
    saveLocalPrefs(next)
    flashSaved()
  }

  // ── sound toggle ──────────────────────────────────────────────────────────
  const handleSoundToggle = (value) => {
    setSoundEnabled(value)
    try { localStorage.setItem('flowdesk-notif-sound', JSON.stringify(value)) } catch {}
    flashSaved()
  }

  // ── mute all ─────────────────────────────────────────────────────────────
  const muteAll = async () => {
    // Turn off all in-app prefs
    const allOff = Object.fromEntries(INAPP_SETTINGS.map(s => [s.key, false]))
    setInAppPrefs(allOff)
    saveLocalPrefs(allOff)
    setSoundEnabled(false)
    try { localStorage.setItem('flowdesk-notif-sound', 'false') } catch {}

    // Turn off email prefs
    const emailOff = { emailNotifications: false, weeklyDigest: false }
    setEmailPrefs(emailOff)
    setSaving(true)
    try {
      const { data } = await api.put('/api/users/profile', { preferences: emailOff })
      updateUser({ preferences: data.user.preferences })
      toast.success('All notifications muted')
    } catch {
      toast.error('Failed to mute email notifications')
    } finally {
      setSaving(false)
    }
  }

  // ── enable all ───────────────────────────────────────────────────────────
  const enableAll = async () => {
    const allOn = Object.fromEntries(INAPP_SETTINGS.map(s => [s.key, true]))
    setInAppPrefs(allOn)
    saveLocalPrefs(allOn)
    setSoundEnabled(true)
    try { localStorage.setItem('flowdesk-notif-sound', 'true') } catch {}

    const emailOn = { emailNotifications: true, weeklyDigest: true }
    setEmailPrefs(emailOn)
    setSaving(true)
    try {
      const { data } = await api.put('/api/users/profile', { preferences: emailOn })
      updateUser({ preferences: data.user.preferences })
      toast.success('All notifications enabled')
    } catch {
      toast.error('Failed to enable email notifications')
    } finally {
      setSaving(false)
    }
  }

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const allMuted = !emailPrefs.emailNotifications && !emailPrefs.weeklyDigest &&
    INAPP_SETTINGS.every(s => !inAppPrefs[s.key]) && !soundEnabled

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control how and when FlowDesk notifies you.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Saved indicator */}
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <CheckCircle2 size={13} /> Saved
            </span>
          )}
          {saving && <Loader2 size={14} className="animate-spin text-brand-500" />}

          {/* Mute / enable all */}
          {allMuted ? (
            <button
              onClick={enableAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-750 transition-colors disabled:opacity-50"
            >
              <Volume2 size={12} />
              Enable all
            </button>
          ) : (
            <button
              onClick={muteAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
            >
              <VolumeX size={12} />
              Mute all
            </button>
          )}
        </div>
      </div>

      {/* ── Email notifications ── */}
      <Section
        title="Email notifications"
        subtitle="Sent to your registered email address"
        icon={Mail}
        iconColor="text-blue-500"
      >
        {EMAIL_SETTINGS.map(setting => (
          <ToggleRow
            key={setting.key}
            {...setting}
            enabled={emailPrefs[setting.key]}
            onChange={(val) => handleEmailToggle(setting.key, val)}
            disabled={saving}
          />
        ))}
      </Section>

      {/* ── In-app notifications ── */}
      <Section
        title="In-app notifications"
        subtitle="Shown in the notification bell while using FlowDesk"
        icon={Bell}
        iconColor="text-brand-500"
      >
        {INAPP_SETTINGS.map(setting => (
          <ToggleRow
            key={setting.key}
            {...setting}
            enabled={inAppPrefs[setting.key]}
            onChange={(val) => handleInAppToggle(setting.key, val)}
            disabled={false}
          />
        ))}
      </Section>

      {/* ── Sound ── */}
      <Section
        title="Sound"
        subtitle="Audio feedback for incoming notifications"
        icon={soundEnabled ? Volume2 : VolumeX}
        iconColor={soundEnabled ? 'text-emerald-500' : 'text-gray-400'}
      >
        <ToggleRow
          icon={soundEnabled ? Volume2 : BellOff}
          label="Notification sounds"
          desc="Play a subtle chime when you receive a new in-app notification"
          color={soundEnabled ? 'text-emerald-500' : 'text-gray-400'}
          bg={soundEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-surface-100 dark:bg-surface-800'}
          enabled={soundEnabled}
          onChange={handleSoundToggle}
          disabled={false}
        />
      </Section>

      {/* ── Info note ── */}
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
        Email preferences are saved to your account and apply across all devices.
        In-app and sound preferences are saved locally on this browser.
      </p>
    </div>
  )
}