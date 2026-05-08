'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Clock, Download, Play, Square, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'
import { formatDate, formatDuration } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TimePage() {
  const { currentWorkspace } = useWorkspace()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalSeconds, setTotalSeconds] = useState(0)

  useEffect(() => { if (currentWorkspace?._id) fetchEntries() }, [currentWorkspace?._id])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/time-entries?workspace=${currentWorkspace._id}&limit=50`)
      const list = data.timeEntries || []
      setEntries(list)
      setTotalSeconds(list.reduce((sum, e) => sum + (e.duration || 0), 0))
    } catch {} finally { setLoading(false) }
  }

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/api/time-entries/${id}`)
      setEntries(prev => prev.filter(e => e._id !== id))
      toast.success('Entry deleted')
    } catch { toast.error('Failed to delete') }
  }

  const exportCSV = () => {
    const rows = [['Task', 'Date', 'Duration (min)', 'Notes']]
    entries.forEach(e => {
      rows.push([e.task?.title || '—', formatDate(e.startTime), Math.round((e.duration || 0) / 60), e.notes || ''])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'timesheet.csv'; a.click()
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
            <p className="text-sm text-gray-400 mt-0.5">Total logged: {formatDuration(totalSeconds)}</p>
          </div>
          <button onClick={exportCSV} className="btn-ghost border border-surface-200 dark:border-surface-700 text-sm gap-2">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <Clock size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No time logged yet</h3>
            <p className="text-sm text-gray-400">Start the timer on any task to track your time</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-2.5 border-b border-surface-200 dark:border-surface-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Task</span><span>Date</span><span>Duration</span><span></span>
            </div>
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {entries.map(e => (
                <div key={e._id} className="grid grid-cols-4 items-center px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                  <span className="text-sm text-gray-900 dark:text-white truncate pr-4">{e.task?.title || 'Unknown task'}</span>
                  <span className="text-sm text-gray-400">{formatDate(e.startTime)}</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">{formatDuration(e.duration || 0)}</span>
                  <div className="flex justify-end">
                    <button onClick={() => deleteEntry(e._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
