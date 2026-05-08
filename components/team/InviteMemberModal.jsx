'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Mail, Crown, User, Shield, Send } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const ROLES = [
  {
    value:       'admin',
    label:       'Admin',
    icon:        Crown,
    description: 'Full access — can manage members, projects and workspace settings.',
    color:       'text-amber-500',
    bg:          'bg-amber-500/10 border-amber-500/30',
  },
  {
    value:       'member',
    label:       'Member',
    icon:        User,
    description: 'Can create and manage tasks, log time and collaborate on projects.',
    color:       'text-brand-500',
    bg:          'bg-brand-500/10 border-brand-500/30',
  },
  {
    value:       'viewer',
    label:       'Viewer',
    icon:        Shield,
    description: 'Read-only access — can view tasks and projects but cannot edit.',
    color:       'text-gray-500',
    bg:          'bg-gray-100 border-gray-200 dark:bg-surface-800 dark:border-gray-700',
  },
]

export default function InviteMemberModal({ open, onClose, workspaceId, onInvited }) {
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('member')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      return setError('Email address is required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address')
    }

    setLoading(true)
    try {
      await api.post(`/api/workspaces/${workspaceId}/invite`, {
        email: email.trim(),
        role,
      })
      toast.success(`Invitation sent to ${email}`)
      setEmail('')
      setRole('member')
      onInvited?.()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send invitation'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('member')
    setError('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite Team Member"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              autoFocus
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${
                error
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/30'
              } bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all`}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* Role selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Role
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => {
              const Icon     = r.icon
              const selected = role === r.value
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    selected
                      ? r.bg
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-surface-800'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selected ? r.bg : 'bg-gray-100 dark:bg-surface-700'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={selected ? r.color : 'text-gray-400'}
                    />
                  </div>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          selected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {r.label}
                      </span>
                      {selected && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.bg} ${r.color}`}>
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  {/* Radio dot */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                      selected
                        ? 'border-brand-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <Send size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            An email invitation will be sent to <strong className="text-gray-700 dark:text-gray-300">{email || 'the recipient'}</strong>. They will need to accept the invite to join the workspace.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={15} />
            }
            Send invitation
          </button>
        </div>
      </form>
    </Modal>
  )
}