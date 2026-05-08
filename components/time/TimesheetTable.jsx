'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isYesterday, parseISO, startOfDay } from 'date-fns'
import { formatDuration } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import {
  Clock, ChevronDown, ChevronRight, Pencil, Trash2,
  DollarSign, Ban, Check, X, Loader2
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), 'h:mm a') } catch { return '—' }
}

function formatDateGroup(dateStr) {
  try {
    const d = parseISO(dateStr)
    if (isToday(d))     return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'EEEE, MMM d, yyyy')
  } catch { return dateStr }
}

function groupByDay(entries = []) {
  const groups = {}
  entries.forEach(entry => {
    const key = entry.startTime
      ? format(parseISO(entry.startTime), 'yyyy-MM-dd')
      : 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  })
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function totalSeconds(entries = []) {
  return entries.reduce((s, e) => s + (e.duration || 0), 0)
}

// ─── Inline edit row ─────────────────────────────────────────────────────────

function EditableRow({ entry, onSave, onCancel }) {
  const [desc, setDesc]         = useState(entry.description || '')
  const [billable, setBillable] = useState(entry.isBillable)
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/api/time-entries/${entry._id}`, {
        description: desc,
        isBillable:  billable,
      })
      onSave(data.entry)
      toast.success('Entry updated')
    } catch {
      toast.error('Failed to update entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="bg-brand-50/50 dark:bg-brand-900/10 border-b border-brand-100 dark:border-brand-900/30">
      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatTime(entry.startTime)}
      </td>
      <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
        {entry.task?.title || '—'}
      </td>
      <td className="px-4 py-2.5">
        {entry.project
          ? <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.project.color || '#6366f1' }} />
              {entry.project.name}
            </span>
          : <span className="text-sm text-gray-400">—</span>
        }
      </td>
      <td className="px-4 py-2.5" colSpan={1}>
        <input
          autoFocus
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          className="input text-sm w-full py-1"
          placeholder="Add description…"
          maxLength={500}
        />
      </td>
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => setBillable(b => !b)}
          className={`p-1.5 rounded-lg transition-colors ${
            billable
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-surface-100 dark:bg-surface-800 text-gray-400'
          }`}
          title={billable ? 'Billable' : 'Non-billable'}
        >
          <DollarSign size={12} />
        </button>
      </td>
      <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
        {formatDuration(entry.duration || 0)}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Single entry row ─────────────────────────────────────────────────────────

function EntryRow({ entry, onUpdate, onDelete }) {
  const [editing, setEditing]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this time entry?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/time-entries/${entry._id}`)
      onDelete(entry._id)
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <EditableRow
        entry={entry}
        onSave={(updated) => { onUpdate(updated); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <tr className="group border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatTime(entry.startTime)}
        {entry.endTime && (
          <span className="text-gray-400 dark:text-gray-500"> – {formatTime(entry.endTime)}</span>
        )}
        {entry.isRunning && (
          <span className="ml-1.5 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
          {entry.task?.title || '—'}
        </span>
      </td>

      <td className="px-4 py-3">
        {entry.project
          ? <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.project.color || '#6366f1' }} />
              <span className="line-clamp-1">{entry.project.name}</span>
            </span>
          : <span className="text-sm text-gray-400">—</span>
        }
      </td>

      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
        <span className="line-clamp-1">{entry.description || <span className="text-gray-300 dark:text-gray-600 italic">No description</span>}</span>
      </td>

      <td className="px-4 py-3 text-center">
        {entry.isBillable
          ? <span title="Billable" className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <DollarSign size={11} />
            </span>
          : <span title="Non-billable" className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-100 dark:bg-surface-800 text-gray-300 dark:text-gray-600">
              <Ban size={11} />
            </span>
        }
      </td>

      <td className="px-4 py-3 text-right">
        <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
          {formatDuration(entry.duration || 0)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Day group ────────────────────────────────────────────────────────────────

function DayGroup({ dateKey, entries, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const dayTotal = totalSeconds(entries)

  const billableTotal = entries
    .filter(e => e.isBillable)
    .reduce((s, e) => s + (e.duration || 0), 0)

  return (
    <>
      {/* Day header row */}
      <tr
        className="bg-surface-50 dark:bg-surface-800/60 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <td colSpan={8} className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-gray-500">
                {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {formatDateGroup(dateKey + 'T00:00:00')}
              </span>
              <Badge variant="default">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Badge>
            </div>
            <div className="flex items-center gap-3">
              {billableTotal > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <DollarSign size={11} />
                  {formatDuration(billableTotal)} billable
                </span>
              )}
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {formatDuration(dayTotal)}
              </span>
            </div>
          </div>
        </td>
      </tr>

      {/* Entry rows */}
      {!collapsed && entries.map(entry => (
        <EntryRow
          key={entry._id}
          entry={entry}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TimesheetTable({ entries = [], loading = false, onUpdate, onDelete }) {
  const grouped = useMemo(() => groupByDay(entries), [entries])
  const grandTotal  = totalSeconds(entries)
  const billableTotal = entries.filter(e => e.isBillable).reduce((s, e) => s + (e.duration || 0), 0)

  if (loading) {
    return (
      <div className="card overflow-hidden animate-pulse">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20" />
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded flex-1" />
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24" />
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <Clock size={22} className="text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No time entries</p>
          <p className="text-xs text-gray-400 mt-1">Start a timer on a task to track your time</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Time</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36">Project</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-16">Bill</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-28">Duration</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {grouped.map(([dateKey, dayEntries]) => (
              <DayGroup
                key={dateKey}
                dateKey={dateKey}
                entries={dayEntries}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </tbody>
          {/* Grand total footer */}
          <tfoot>
            <tr className="border-t-2 border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/60">
              <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total — {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </td>
              <td className="px-4 py-3 text-center text-xs text-green-600 dark:text-green-400">
                {formatDuration(billableTotal)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-base text-gray-900 dark:text-white">
                {formatDuration(grandTotal)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}