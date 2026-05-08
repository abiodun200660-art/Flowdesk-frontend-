'use client'

import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import {
  Download, FileText, Table, ChevronDown,
  Loader2, FileDown, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ExportButton({
  startDate = '',
  endDate   = '',
  className = '',
}) {
  const { currentWorkspace } = useWorkspace()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(null) // 'csv' | 'pdf' | null
  const [exported, setExported] = useState(null) // 'csv' | 'pdf' | null — brief checkmark flash
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Flash check then clear
  const flashCheck = (type) => {
    setExported(type)
    setTimeout(() => setExported(null), 2000)
  }

  const buildParams = () => {
    const params = new URLSearchParams()
    if (currentWorkspace?._id) params.set('workspace', currentWorkspace._id)
    if (startDate) params.set('startDate', startDate)
    if (endDate)   params.set('endDate',   endDate)
    return params.toString()
  }

  // ── CSV export — streams direct download via fetch + blob ──────────────────
  const handleCSV = async () => {
    if (!currentWorkspace?._id) { toast.error('No workspace selected'); return }
    setLoading('csv')
    setOpen(false)
    try {
      const res = await fetch(
        `${API_BASE}/api/time-entries/export/csv?${buildParams()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `flowdesk-timesheet-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      flashCheck('csv')
      toast.success('Timesheet exported as CSV')
    } catch (err) {
      console.error(err)
      toast.error('CSV export failed')
    } finally {
      setLoading(null)
    }
  }

  // ── PDF export — opens the print-ready HTML in a new tab ──────────────────
  const handlePDF = async () => {
    if (!currentWorkspace?._id) { toast.error('No workspace selected'); return }
    setLoading('pdf')
    setOpen(false)
    try {
      const res = await fetch(
        `${API_BASE}/api/time-entries/export/pdf?${buildParams()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error(await res.text())

      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)

      const win = window.open(url, '_blank')
      // Give the tab a moment to load then auto-trigger print dialog
      if (win) {
        win.addEventListener('load', () => {
          setTimeout(() => {
            win.print()
            URL.revokeObjectURL(url)
          }, 300)
        })
      } else {
        // Popup blocked — fall back to direct link
        const a    = document.createElement('a')
        a.href     = url
        a.download = `flowdesk-timesheet-${new Date().toISOString().slice(0, 10)}.html`
        a.click()
        URL.revokeObjectURL(url)
      }

      flashCheck('pdf')
      toast.success('PDF report ready — use browser print to save')
    } catch (err) {
      console.error(err)
      toast.error('PDF export failed')
    } finally {
      setLoading(null)
    }
  }

  const busy = !!loading

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => !busy && setOpen(o => !o)}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all
          ${open
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
            : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-300 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-750'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin text-brand-500" />
        ) : (
          <Download size={14} />
        )}
        <span>{busy ? (loading === 'csv' ? 'Exporting CSV…' : 'Generating PDF…') : 'Export'}</span>
        {!busy && (
          <ChevronDown size={13} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {open && !busy && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-52 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-modal overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-surface-100 dark:border-surface-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Export timesheet
            </p>
            {(startDate || endDate) && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {startDate && endDate
                  ? `${startDate} → ${endDate}`
                  : startDate || endDate}
              </p>
            )}
          </div>

          {/* CSV option */}
          <button
            onClick={handleCSV}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              {exported === 'csv'
                ? <Check size={14} className="text-green-600 dark:text-green-400" />
                : <Table size={14} className="text-green-600 dark:text-green-400" />
              }
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Export CSV</p>
              <p className="text-xs text-gray-400 truncate">Spreadsheet-ready format</p>
            </div>
            <FileDown size={13} className="ml-auto text-gray-300 dark:text-gray-600 flex-shrink-0" />
          </button>

          {/* Divider */}
          <div className="mx-3 border-t border-surface-100 dark:border-surface-800" />

          {/* PDF option */}
          <button
            onClick={handlePDF}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              {exported === 'pdf'
                ? <Check size={14} className="text-red-600 dark:text-red-400" />
                : <FileText size={14} className="text-red-600 dark:text-red-400" />
              }
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Export PDF</p>
              <p className="text-xs text-gray-400 truncate">Print-ready report</p>
            </div>
            <FileDown size={13} className="ml-auto text-gray-300 dark:text-gray-600 flex-shrink-0" />
          </button>

          {/* Footer note */}
          <div className="px-3 py-2 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/60">
            <p className="text-[10px] text-gray-400 leading-snug">
              Exports your entries for the selected date range in this workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}