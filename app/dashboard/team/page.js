'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Plus, Users, Mail, MoreHorizontal, Crown, Trash2, Shield } from 'lucide-react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useAuth } from '@/context/AuthContext'
import { getInitials, stringToColor } from '@/lib/utils'
import toast from 'react-hot-toast'

function InviteModal({ onClose, onInvited }) {
  const { currentWorkspace } = useWorkspace()
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState('member')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/api/workspaces/${currentWorkspace._id}/invite`, { email, role })
      toast.success(`Invite sent to ${email}`)
      onInvited()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm card shadow-modal animate-slide-up p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Invite Team Member</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="colleague@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const { currentWorkspace } = useWorkspace()
  const { user }             = useAuth()
  const [ws, setWs]          = useState(null)
  const [loading, setLoading]  = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => { if (currentWorkspace?._id) fetchWs() }, [currentWorkspace?._id])

  const fetchWs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/workspaces/${currentWorkspace._id}`)
      setWs(data.workspace)
    } catch {} finally { setLoading(false) }
  }

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/api/workspaces/${currentWorkspace._id}/members/${userId}`)
      fetchWs()
      toast.success('Member removed')
    } catch { toast.error('Failed to remove member') }
  }

  const members = ws?.members || []
  const isOwner = ws?.owner === user?._id

  const getRoleIcon = (role) => {
    if (role === 'owner') return <Crown size={12} className="text-yellow-500" />
    if (role === 'admin') return <Shield size={12} className="text-brand-500" />
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
            <p className="text-sm text-gray-400 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setInviteOpen(true)} className="btn-primary">
            <Plus size={15} /> Invite Member
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : (
          <div className="card divide-y divide-surface-100 dark:divide-surface-800 overflow-hidden">
            {members.map(m => {
              const memberUser = m.user || m
              const role = m.role || 'member'
              const isMe = memberUser._id === user?._id
              return (
                <div key={memberUser._id || m._id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                  {memberUser.avatar ? (
                    <img src={memberUser.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: stringToColor(memberUser.name || '') }}>
                      {getInitials(memberUser.name || '')}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{memberUser.name}{isMe && ' (you)'}</p>
                      {getRoleIcon(role)}
                    </div>
                    <p className="text-xs text-gray-400">{memberUser.email}</p>
                  </div>
                  <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400">{role}</span>
                  {isOwner && !isMe && (
                    <button onClick={() => removeMember(memberUser._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvited={fetchWs} />}
    </DashboardLayout>
  )
}
