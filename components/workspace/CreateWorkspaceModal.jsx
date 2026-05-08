'use client'

import { useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import Modal from '@/components/ui/Modal'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layers, Check } from 'lucide-react'

const PRESET_COLORS = [
  '#2d5aff', '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#06b6d4', '#ef4444',
  '#f97316', '#84cc16', '#14b8a6', '#64748b',
]

export default function CreateWorkspaceModal({ open, onClose }) {
  const { addWorkspace } = useWorkspace()

  const [form, setForm] = useState({ name: '', description: '', color: '#2d5aff' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Workspace name is required'
    if (form.name.trim().length > 50) e.name = 'Name must be under 50 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      const { data } = await api.post('/api/workspaces', {
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
      })
      addWorkspace(data.workspace)
      toast.success(`"${data.workspace.name}" created!`)
      handleClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ name: '', description: '', color: '#2d5aff' })
    setErrors({})
    onClose()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create workspace" size="md">
      <div className="p-6 space-y-5">

        {/* Preview badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-200"
            style={{ background: form.color }}
          >
            <Layers size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {form.name.trim() || 'Workspace name'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {form.description.trim() || 'No description'}
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="label">Workspace name <span className="text-red-400">*</span></label>
          <input
            className={`input w-full ${errors.name ? 'border-red-400 focus:ring-red-400/30' : ''}`}
            placeholder="e.g. Marketing Team"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onKeyDown={handleKey}
            maxLength={50}
            autoFocus
          />
          {errors.name
            ? <p className="text-xs text-red-500">{errors.name}</p>
            : <p className="text-xs text-gray-400">{form.name.length}/50</p>
          }
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            className="input w-full resize-none"
            placeholder="What is this workspace for?"
            rows={2}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-gray-400 text-right">{form.description.length}/200</p>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="label">Workspace color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('color', color)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-900"
                style={{ background: color, focusRingColor: color }}
                title={color}
              >
                {form.color === color && (
                  <Check size={13} className="text-white drop-shadow" />
                )}
              </button>
            ))}
            {/* Custom color input */}
            <label
              className="w-7 h-7 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center cursor-pointer hover:border-brand-400 transition-colors overflow-hidden"
              title="Custom color"
            >
              <input
                type="color"
                value={form.color}
                onChange={e => set('color', e.target.value)}
                className="opacity-0 absolute w-0 h-0"
              />
              <span className="text-[10px] text-gray-400 leading-none select-none">+</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-surface-200 dark:border-surface-800">
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating…
            </>
          ) : (
            <>
              <Layers size={14} />
              Create workspace
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}