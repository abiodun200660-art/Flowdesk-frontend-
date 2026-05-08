'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

const STATUSES = [
  { value: '',           label: 'All Statuses' },
  { value: 'active',    label: 'Active'        },
  { value: 'on-hold',   label: 'On Hold'       },
  { value: 'completed', label: 'Completed'     },
  { value: 'cancelled', label: 'Cancelled'     },
]

export default function ProjectFilters({ filters = {}, onChange }) {
  const [open, setOpen] = useState(false)

  const hasActive = Object.values(filters).some((v) => v !== '' && v !== undefined)

  const set = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const clear = () => {
    onChange({})
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
          hasActive
            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-700'
        }`}
      >
        <Filter size={15} />
        Filters
        {hasActive && (
          <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
            {Object.values(filters).filter((v) => v !== '' && v !== undefined).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 z-30 animate-slide-up space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Filters
            </h4>
            {hasActive && (
              <button
                onClick={clear}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Sort by
            </label>
            <select
              value={filters.sort || ''}
              onChange={(e) => set('sort', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            >
              <option value="">Default</option>
              <option value="name">Name</option>
              <option value="deadline">Deadline</option>
              <option value="completion">Completion %</option>
              <option value="createdAt">Date created</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Search
            </label>
            <input
              type="text"
              placeholder="Project name..."
              value={filters.search || ''}
              onChange={(e) => set('search', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Apply button */}
          <button
            onClick={() => setOpen(false)}
            className="w-full py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
          >
            Apply filters
          </button>
        </div>
      )}
    </div>
  )
}