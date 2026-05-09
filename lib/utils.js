'use client'

import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
} from 'date-fns'

// ─── Date helpers ────────────────────────────────────────────────────────────

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—'
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, fmt)
  } catch {
    return '—'
  }
}

export const formatRelative = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isToday(d))    return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return '—'
  }
}

export const isOverdue = (date) => {
  if (!date) return false
  try {
    return isPast(typeof date === 'string' ? parseISO(date) : date)
  } catch {
    return false
  }
}

export const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// ─── Priority config ─────────────────────────────────────────────────────────

export const priorityConfig = {
  critical: { label: 'Critical', dot: 'bg-red-500',    cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  high:     { label: 'High',     dot: 'bg-orange-500', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  medium:   { label: 'Medium',   dot: 'bg-yellow-500', cls: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-500' },
  low:      { label: 'Low',      dot: 'bg-green-500',  cls: 'bg-green-500/15 text-green-600 dark:text-green-400' },
}

// ─── Status config ────────────────────────────────────────────────────────────

export const statusConfig = {
  'todo':        { label: 'To Do',       color: '#8891b5', cls: 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200' },
  'in-progress': { label: 'In Progress', color: '#2d5aff', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  'completed':   { label: 'Completed',   color: '#10b981', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
}

// ─── String / avatar helpers ─────────────────────────────────────────────────

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

export const stringToColor = (str = '') => {
  const colors = [
    '#2d5aff', '#8b5cf6', '#10b981', '#f59e0b',
    '#f43f5e', '#00d9ff', '#ec4899', '#14b8a6',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const truncate = (str = '', len = 60) =>
  str.length > len ? str.slice(0, len) + '…' : str

// ─── Class name helper ────────────────────────────────────────────────────────

export const cn = (...classes) => classes.filter(Boolean).join(' ')