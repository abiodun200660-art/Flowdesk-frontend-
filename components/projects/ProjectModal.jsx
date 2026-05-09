'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'

export default function ProjectModal({ project, onClose, onSave }) {
  const { currentWorkspace } = useWorkspace()
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#2d5aff',
    startDate: project?.startDate?.slice(0, 10) || '',
    endDate: project?.endDate?.slice(0, 10) || '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, workspace: currentWorkspace._id }
      const { data } = project
        ? await api.put(`/api/projects/${project._id}`, payload)
        : await api.post('/api/projects', payload)
      toast.success(project ? 'Project updated' : 'Project created')
      onSave(data.project)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setLoading(false) }
  }

  const COLORS = ['#2d5aff','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card shadow-modal animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Project name</label>
            <input className="input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm(p => ({...p, name: e.target.value}))} required autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
              value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({...p, color: c}))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} />
            </div>
            <div>
              <label className="label">End date</label>
              <input type="date" className="input" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
