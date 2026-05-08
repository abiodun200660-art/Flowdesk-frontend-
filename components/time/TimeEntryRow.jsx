'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { formatDuration } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import {
  Pencil, Trash2, Check, X, DollarSign, Ban,
  Clock, Loader2, ChevronRight, FolderOpen
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr, pattern = 'h:mm a') {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), pattern) } catch { return '—' }
}

// ─── Inline edit state ────────────────────────────────────────────────────────

function InlineEdit({ entry, onSave, onCancel }) {
  const [desc, setDesc]         = useState(entry.description || '')
  const [billable, setBillable] = useState(!!entry.isBillable)
  const [startTime, setStartTime] = useState(
    entry.startTime ? format(parseISO(entry.startTime), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [endTime, setEndTime] = useState(
    entry.endTime ? format(parseISO(entry.endTime), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        description: desc.trim(),
        isBillable:  billable,
      }
      if (startTime) payload.startTime = new Date(startTime).toISOString()
      if (endTime)   payload.endTime   = new Date(endTime).toISOString()

      const { data } = await api.put(`/api/time-entries/${entry._id}`, payload)
      onSave(data.entry)
      toast.success('Entry updated')
    } catch {
      toast.error('Failed to update entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 bg-brand-50/60 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/40 rounded-xl space-y-3 animate-fade-in">
      {/* Times row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Start time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="input text-sm py-1.5 px-2 w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">End time</label>
          <input
            type="datetime-local"
            value={endTime}
            min={startTime}
            onChange={e => setEndTime(e.target.value)}
            className="input text-sm py-1.5 px-2 w-full"
            disabled={entry.isRunning}
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
        <input
          autoFocus
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          className="input text-sm w-full"
          placeholder="What were you working on?"
          maxLength={500}
        />
      </div>

      {/* Billable + actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setBillable(b => !b)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              billable
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-surface-100 dark:bg-surface-800 text-gray-400'
            }`}
          >
            {billable ? <DollarSign size={11} /> : <Ban size={11} />}
            {billable ? 'Billable' : 'Non-billable'}
          </div>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X size={13} /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm btn-primary disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TimeEntryRow({ entry, onUpdate, onDelete, compact = false }) {
  const [editing, setEditing]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this time entry? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/api/time-entries/${entry._id}`)
      onDelete?.(entry._id)
      toast.success('Time entry deleted')
    } catch {
      toast.error('Failed to delete entry')
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="px-1">
        <InlineEdit
          entry={entry}
          onSave={(updated) => { onUpdate?.(updated); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  // ── Compact variant (used inside TimesheetTable rows) ──
  if (compact) {
    return (
      <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
        {/* Running pulse */}
        {entry.isRunning && (
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}

        {/* Time range */}
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono flex-shrink-0 w-28">
          {fmt(entry.startTime)}
          {entry.endTime && !entry.isRunning && ` – ${fmt(entry.endTime)}`}
          {entry.isRunning && <span className="text-green-500 ml-1">Live</span>}
        </span>

        {/* Task */}
        <span className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate min-w-0">
          {entry.task?.title || '—'}
        </span>

        {/* Description */}
        {entry.description && (
          <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[160px]">
            {entry.description}
          </span>
        )}

        {/* Billable */}
        <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded ${
          entry.isBillable
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-surface-100 dark:bg-surface-800 text-gray-300 dark:text-gray-600'
        }`}>
          {entry.isBillable ? <DollarSign size={10} /> : <Ban size={10} />}
        </span>

        {/* Duration */}
        <span className="flex-shrink-0 font-mono text-sm font-semibold text-brand-600 dark:text-brand-400 w-20 text-right">
          {formatDuration(entry.duration || 0)}
        </span>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>
    )
  }

  // ── Full card variant (standalone use / mobile) ──
  return (
    <div className="group card p-0 overflow-hidden hover:shadow-md transition-all animate-fade-in">
      {/* Running indicator strip */}
      {entry.isRunning && (
        <div className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
      )}

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* User avatar */}
            {entry.user && <Avatar user={entry.user} size={32} className="flex-shrink-0 mt-0.5" />}

            <div className="min-w-0 flex-1">
              {/* Task title */}
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {entry.task?.title || 'Unknown task'}
              </p>

              {/* Project + description */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {entry.project && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: entry.project.color || '#6366f1' }}
                    />
                    {entry.project.name}
                  </span>
                )}
                {entry.description && (
                  <>
                    {entry.project && <span className="text-gray-300 dark:text-gray-600">·</span>}
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[240px]">
                      {entry.description}
                    </span>
                  </>
                )}
                {!entry.description && !entry.project && (
                  <span className="text-xs text-gray-300 dark:text-gray-600 italic">No description</span>
                )}
              </div>
            </div>
          </div>

          {/* Duration pill */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
              {formatDuration(entry.duration || 0)}
            </span>
            {entry.isRunning && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Running
              </span>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          {/* Time range */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock size={12} className="flex-shrink-0" />
            <span className="font-mono">
              {fmt(entry.startTime)}
              {entry.endTime && !entry.isRunning
                ? <> <ChevronRight size={10} className="inline" /> {fmt(entry.endTime)}</>
                : entry.isRunning ? <span className="text-green-500 ml-1">→ now</span> : null
              }
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>{entry.startTime ? format(parseISO(entry.startTime), 'MMM d') : '—'}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Billable badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              entry.isBillable
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-surface-100 dark:bg-surface-800 text-gray-400'
            }`}>
              {entry.isBillable ? <DollarSign size={10} /> : <Ban size={10} />}
              {entry.isBillable ? 'Billable' : 'Non-billable'}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                title="Edit entry"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                title="Delete entry"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}