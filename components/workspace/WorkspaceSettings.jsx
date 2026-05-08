'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import {
  Layers, Save, Trash2, UserMinus, UserPlus, Crown,
  ShieldCheck, Eye, ChevronDown, Check, AlertTriangle,
  Mail, Settings, Loader2
} from 'lucide-react'

const PRESET_COLORS = [
  '#2d5aff', '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#06b6d4', '#ef4444',
  '#f97316', '#84cc16', '#14b8a6', '#64748b',
]

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  icon: ShieldCheck, variant: 'brand',   desc: 'Can manage workspace, invite members, and edit all content' },
  member: { label: 'Member', icon: UserPlus,    variant: 'default', desc: 'Can view and edit assigned projects and tasks' },
  viewer: { label: 'Viewer', icon: Eye,         variant: 'default', desc: 'Read-only access to workspace content' },
}

function RoleDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const current = ROLE_CONFIG[value]
  const Icon = current?.icon

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-750 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {Icon && <Icon size={11} />}
        {current?.label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-modal z-20 overflow-hidden">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
            const RIcon = cfg.icon
            return (
              <button
                key={role}
                onClick={() => { onChange(role); setOpen(false) }}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 text-left transition-colors"
              >
                <RIcon size={13} className="mt-0.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cfg.label}</span>
                    {value === role && <Check size={12} className="text-brand-500" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{cfg.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WorkspaceSettings({ open, onClose }) {
  const { user } = useAuth()
  const { currentWorkspace, updateWorkspace, removeWorkspace } = useWorkspace()

  // General tab state
  const [form, setForm]       = useState({ name: '', description: '', color: '#2d5aff' })
  const [formErrors, setFormErrors] = useState({})
  const [savingInfo, setSavingInfo] = useState(false)

  // Members state
  const [members, setMembers]   = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState('member')
  const [inviting, setInviting]       = useState(false)
  const [inviteError, setInviteError] = useState('')

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting]           = useState(false)

  const [activeTab, setActiveTab] = useState('general')

  const isOwner = currentWorkspace?.owner?._id === user?._id || currentWorkspace?.owner === user?._id
  const myRole  = currentWorkspace?.members?.find(
    m => (m.user?._id || m.user) === user?._id
  )?.role
  const isAdmin = isOwner || myRole === 'admin'

  useEffect(() => {
    if (open && currentWorkspace) {
      setForm({
        name:        currentWorkspace.name        || '',
        description: currentWorkspace.description || '',
        color:       currentWorkspace.color       || '#2d5aff',
      })
      fetchMembers()
    }
  }, [open, currentWorkspace])

  const fetchMembers = async () => {
    if (!currentWorkspace?._id) return
    setLoadingMembers(true)
    try {
      const { data } = await api.get(`/api/workspaces/${currentWorkspace._id}`)
      setMembers(data.workspace.members || [])
    } catch {
      toast.error('Failed to load members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (formErrors[k]) setFormErrors(e => ({ ...e, [k]: '' }))
  }

  const handleSaveInfo = async () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (Object.keys(e).length) { setFormErrors(e); return }

    setSavingInfo(true)
    try {
      const { data } = await api.put(`/api/workspaces/${currentWorkspace._id}`, {
        name:        form.name.trim(),
        description: form.description.trim(),
        color:       form.color,
      })
      updateWorkspace(data.workspace)
      toast.success('Workspace updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update workspace')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { setInviteError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) { setInviteError('Enter a valid email'); return }
    setInviting(true)
    setInviteError('')
    try {
      await api.post(`/api/workspaces/${currentWorkspace._id}/invite`, {
        email: inviteEmail.trim(),
        role:  inviteRole,
      })
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('member')
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/workspaces/${currentWorkspace._id}`, {
        memberUpdate: { userId, role: newRole },
      })
      setMembers(prev =>
        prev.map(m =>
          (m.user?._id || m.user) === userId ? { ...m, role: newRole } : m
        )
      )
      toast.success('Role updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (userId, memberName) => {
    if (!confirm(`Remove ${memberName} from this workspace?`)) return
    try {
      await api.delete(`/api/workspaces/${currentWorkspace._id}/members/${userId}`)
      setMembers(prev => prev.filter(m => (m.user?._id || m.user) !== userId))
      toast.success(`${memberName} removed`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== currentWorkspace?.name) return
    setDeleting(true)
    try {
      await api.delete(`/api/workspaces/${currentWorkspace._id}`)
      removeWorkspace(currentWorkspace._id)
      toast.success('Workspace deleted')
      handleClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workspace')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setActiveTab('general')
    setDeleteConfirm('')
    setInviteEmail('')
    setInviteError('')
    onClose()
  }

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'members', label: `Members${members.length ? ` (${members.length})` : ''}` },
    ...(isOwner ? [{ id: 'danger', label: 'Danger zone' }] : []),
  ]

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      {/* Custom header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-200 dark:border-surface-800">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: currentWorkspace?.color || '#2d5aff' }}
        >
          <Layers size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {currentWorkspace?.name}
          </h2>
          <p className="text-xs text-gray-400">Workspace settings</p>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-surface-200 dark:border-surface-800 px-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-1 mr-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } ${tab.id === 'danger' ? 'text-red-500 hover:text-red-600' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-h-[60vh] overflow-y-auto">

        {/* ── GENERAL TAB ── */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                style={{ background: form.color }}
              >
                <Layers size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {form.name || 'Workspace name'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {form.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="label">Workspace name <span className="text-red-400">*</span></label>
              <input
                className={`input w-full ${formErrors.name ? 'border-red-400 focus:ring-red-400/30' : ''}`}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                disabled={!isAdmin}
                maxLength={100}
                placeholder="My Workspace"
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="label">Description</label>
              <textarea
                className="input w-full resize-none"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                disabled={!isAdmin}
                rows={2}
                maxLength={500}
                placeholder="What is this workspace for?"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="label">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    disabled={!isAdmin}
                    onClick={() => set('color', color)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: color }}
                  >
                    {form.color === color && <Check size={13} className="text-white drop-shadow" />}
                  </button>
                ))}
                <label className="w-7 h-7 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center cursor-pointer hover:border-brand-400 transition-colors">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                    className="opacity-0 absolute w-0 h-0"
                    disabled={!isAdmin}
                  />
                  <span className="text-[10px] text-gray-400 select-none">+</span>
                </label>
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {savingInfo
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Save size={14} />
                  }
                  {savingInfo ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {activeTab === 'members' && (
          <div className="space-y-5">
            {/* Invite form — admins only */}
            {isAdmin && (
              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus size={14} className="text-brand-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Invite member</h3>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      className={`input w-full text-sm ${inviteError ? 'border-red-400' : ''}`}
                      placeholder="colleague@company.com"
                      type="email"
                      value={inviteEmail}
                      onChange={e => { setInviteEmail(e.target.value); setInviteError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    />
                    {inviteError && <p className="text-xs text-red-500 mt-1">{inviteError}</p>}
                  </div>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="input text-sm px-2 pr-7 w-28 flex-shrink-0"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="btn-primary flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                  >
                    {inviting
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Mail size={13} />
                    }
                    Invite
                  </button>
                </div>
              </div>
            )}

            {/* Members list */}
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-brand-500" />
              </div>
            ) : (
              <div className="space-y-1">
                {members.map(member => {
                  const memberUser  = member.user
                  const memberId    = memberUser?._id || memberUser
                  const isThisOwner = (currentWorkspace?.owner?._id || currentWorkspace?.owner) === memberId
                  const isSelf      = memberId === user?._id
                  const canModify   = isAdmin && !isThisOwner && !isSelf

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors group"
                    >
                      <Avatar user={memberUser} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {memberUser?.name || 'Unknown'}
                          </span>
                          {isThisOwner && (
                            <Crown size={12} className="text-yellow-500 flex-shrink-0" />
                          )}
                          {isSelf && (
                            <span className="text-xs text-gray-400">(you)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{memberUser?.email}</p>
                      </div>

                      {canModify ? (
                        <RoleDropdown
                          value={member.role}
                          onChange={role => handleRoleChange(memberId, role)}
                        />
                      ) : (
                        <Badge
                          variant={member.role === 'admin' ? 'brand' : 'default'}
                        >
                          {ROLE_CONFIG[member.role]?.label || member.role}
                        </Badge>
                      )}

                      {canModify && (
                        <button
                          onClick={() => handleRemoveMember(memberId, memberUser?.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <UserMinus size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DANGER ZONE TAB ── */}
        {activeTab === 'danger' && isOwner && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Delete workspace</h3>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    This will permanently delete <strong>{currentWorkspace?.name}</strong> and all its
                    projects, tasks, and data. This action <strong>cannot be undone</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Type <span className="font-mono font-bold text-red-600 dark:text-red-400">{currentWorkspace?.name}</span> to confirm
                </label>
                <input
                  className="input w-full text-sm border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400/30"
                  placeholder={currentWorkspace?.name}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                />
              </div>

              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== currentWorkspace?.name || deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />
                }
                {deleting ? 'Deleting…' : 'Delete workspace permanently'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}