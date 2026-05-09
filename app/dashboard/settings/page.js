'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { User, Lock, Bell, Building2, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'

function ProfileTab() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [loading, setLoading] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/api/users/profile', form)
      updateUser(data.user)
      toast.success('Profile updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-md">
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save changes'}
      </button>
    </form>
  )
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.put('/api/users/password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password updated')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-md">
      {[['Current password', 'currentPassword'], ['New password', 'newPassword'], ['Confirm password', 'confirmPassword']].map(([label, key]) => (
        <div key={key}>
          <label className="label">{label}</label>
          <input type="password" className="input" value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} />
        </div>
      ))}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Update password'}
      </button>
    </form>
  )
}

function WorkspaceTab() {
  const { currentWorkspace, updateWorkspace } = useWorkspace()
  const [form, setForm] = useState({ name: currentWorkspace?.name || '', description: currentWorkspace?.description || '' })
  const [loading, setLoading] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put(`/api/workspaces/${currentWorkspace._id}`, form)
      updateWorkspace(data.workspace)
      toast.success('Workspace updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-md">
      <div>
        <label className="label">Workspace name</label>
        <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save workspace'}
      </button>
    </form>
  )
}

const TABS = [
  { id: 'profile',   label: 'Profile',    icon: User,      Component: ProfileTab },
  { id: 'security',  label: 'Security',   icon: Lock,      Component: SecurityTab },
  { id: 'workspace', label: 'Workspace',  icon: Building2, Component: WorkspaceTab },
]

export default function SettingsPage() {
  const [active, setActive] = useState('profile')
  const current = TABS.find(t => t.id === active)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
        <div className="flex gap-6">
          <nav className="w-44 flex-shrink-0 space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${active === id ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
          <div className="flex-1 card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">{current?.label}</h2>
            {current && <current.Component />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
