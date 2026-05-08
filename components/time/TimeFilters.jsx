'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, X, ChevronDown, Calendar, User,
  FolderOpen, DollarSign, SlidersHorizontal, RotateCcw
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_RANGES = [
  { label: 'Today',        getValue: () => ({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Yesterday',    getValue: () => ({ startDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'), endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd') }) },
  { label: 'This week',    getValue: () => ({ startDate: format(startOfWeek(new Date()), 'yyyy-MM-dd'), endDate: format(endOfWeek(new Date()), 'yyyy-MM-dd') }) },
  { label: 'Last 7 days',  getValue: () => ({ startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 14 days', getValue: () => ({ startDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This month',   getValue: () => ({ startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'), endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
  { label: 'Last 30 days', getValue: () => ({ startDate: format(subDays(new Date(), 29), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
]

const SORT_OPTIONS = [
  { value: 'startTime_desc', label: 'Newest first' },
  { value: 'startTime_asc',  label: 'Oldest first' },
  { value: 'duration_desc',  label: 'Longest first' },
  { value: 'duration_asc',   label: 'Shortest first' },
]

export const DEFAULT_TIME_FILTERS = {
  search:     '',
  startDate:  format(startOfWeek(new Date()), 'yyyy-MM-dd'),
  endDate:    format(new Date(), 'yyyy-MM-dd'),
  projectIds: [],
  memberIds:  [],
  billable:   'all', // 'all' | 'billable' | 'non-billable'
  sort:       'startTime_desc',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterDropdown({ label, icon: Icon, children, active, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-all
          ${active
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
            : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 hover:border-surface-300 dark:hover:border-surface-600'
          }`}
      >
        <Icon size={13} />
        <span>{label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 z-30 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-modal min-w-[200px] overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="p-2" onClick={e => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckRow({ label, checked, onChange, icon, color }) {
  return (
    <label className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded accent-brand-500 flex-shrink-0"
      />
      {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />}
      {icon && <span className="flex-shrink-0 text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{label}</span>
    </label>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TimeFilters({
  filters = DEFAULT_TIME_FILTERS,
  onChange,
  projects  = [],
  members   = [],
  className = '',
}) {
  const update = useCallback((patch) => {
    onChange?.({ ...filters, ...patch })
  }, [filters, onChange])

  const toggleArr = (key, id) => {
    const arr = filters[key] || []
    update({ [key]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] })
  }

  const clearAll = () => onChange?.(DEFAULT_TIME_FILTERS)

  const activeFiltersCount = [
    filters.search,
    filters.projectIds?.length,
    filters.memberIds?.length,
    filters.billable !== 'all',
  ].filter(Boolean).length

  // Which quick range is currently active
  const activeQuickRange = QUICK_RANGES.find(r => {
    const v = r.getValue()
    return v.startDate === filters.startDate && v.endDate === filters.endDate
  })?.label

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Row 1: search + date + filters ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
            placeholder="Search entries…"
            className="input w-full pl-9 pr-8 text-sm py-2"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Date range */}
        <FilterDropdown
          label={activeQuickRange || (filters.startDate && filters.endDate ? `${filters.startDate} → ${filters.endDate}` : 'Date range')}
          icon={Calendar}
          active={!!(filters.startDate || filters.endDate)}
        >
          {/* Quick ranges */}
          <div className="pb-2 mb-2 border-b border-surface-100 dark:border-surface-700">
            {QUICK_RANGES.map(r => (
              <button
                key={r.label}
                onClick={() => update(r.getValue())}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors ${
                  activeQuickRange === r.label
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Custom range */}
          <div className="space-y-2 px-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Custom range</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => update({ startDate: e.target.value })}
                  className="input text-sm py-1.5 px-2 w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate}
                  onChange={e => update({ endDate: e.target.value })}
                  className="input text-sm py-1.5 px-2 w-full"
                />
              </div>
            </div>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => update({ startDate: '', endDate: '' })}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear dates
              </button>
            )}
          </div>
        </FilterDropdown>

        {/* Projects */}
        {projects.length > 0 && (
          <FilterDropdown
            label="Project"
            icon={FolderOpen}
            active={filters.projectIds?.length > 0}
          >
            {filters.projectIds?.length > 0 && (
              <button
                onClick={() => update({ projectIds: [] })}
                className="w-full text-left text-xs text-red-500 hover:text-red-600 px-2 py-1 mb-1"
              >
                Clear selection
              </button>
            )}
            {projects.map(p => (
              <CheckRow
                key={p._id}
                label={p.name}
                checked={filters.projectIds?.includes(p._id)}
                onChange={() => toggleArr('projectIds', p._id)}
                color={p.color || '#6366f1'}
              />
            ))}
          </FilterDropdown>
        )}

        {/* Members */}
        {members.length > 0 && (
          <FilterDropdown
            label="Member"
            icon={User}
            active={filters.memberIds?.length > 0}
          >
            {filters.memberIds?.length > 0 && (
              <button
                onClick={() => update({ memberIds: [] })}
                className="w-full text-left text-xs text-red-500 hover:text-red-600 px-2 py-1 mb-1"
              >
                Clear selection
              </button>
            )}
            {members.map(m => (
              <CheckRow
                key={m._id}
                label={m.name}
                checked={filters.memberIds?.includes(m._id)}
                onChange={() => toggleArr('memberIds', m._id)}
              />
            ))}
          </FilterDropdown>
        )}

        {/* Billable */}
        <FilterDropdown
          label={filters.billable === 'all' ? 'Billable' : filters.billable === 'billable' ? 'Billable only' : 'Non-billable'}
          icon={DollarSign}
          active={filters.billable !== 'all'}
        >
          {[
            { value: 'all',          label: 'All entries' },
            { value: 'billable',     label: 'Billable only' },
            { value: 'non-billable', label: 'Non-billable only' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ billable: opt.value })}
              className={`w-full text-left px-2 py-2 text-sm rounded-lg transition-colors ${
                filters.billable === opt.value
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </FilterDropdown>

        {/* Sort */}
        <FilterDropdown
          label={SORT_OPTIONS.find(o => o.value === filters.sort)?.label || 'Sort'}
          icon={SlidersHorizontal}
          active={filters.sort !== 'startTime_desc'}
          align="right"
        >
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ sort: opt.value })}
              className={`w-full text-left px-2 py-2 text-sm rounded-lg transition-colors ${
                filters.sort === opt.value
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </FilterDropdown>

        {/* Clear all */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}
      </div>

      {/* ── Row 2: active filter chips ── */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 animate-fade-in">
          <span className="text-xs text-gray-400">Active:</span>

          {filters.search && (
            <Chip label={`"${filters.search}"`} onRemove={() => update({ search: '' })} />
          )}

          {filters.projectIds?.map(id => {
            const p = projects.find(x => x._id === id)
            return p ? (
              <Chip
                key={id}
                label={p.name}
                color={p.color}
                onRemove={() => toggleArr('projectIds', id)}
              />
            ) : null
          })}

          {filters.memberIds?.map(id => {
            const m = members.find(x => x._id === id)
            return m ? (
              <Chip
                key={id}
                label={m.name}
                onRemove={() => toggleArr('memberIds', id)}
              />
            ) : null
          })}

          {filters.billable !== 'all' && (
            <Chip
              label={filters.billable === 'billable' ? 'Billable' : 'Non-billable'}
              onRemove={() => update({ billable: 'all' })}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, color, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300"
    >
      {color && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />}
      {label}
      <button
        onClick={onRemove}
        className="flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
      >
        <X size={10} />
      </button>
    </span>
  )
}