'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { BarChart2, Download, TrendingUp } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace()
  const [trend, setTrend]   = useState([])
  const [perf, setPerf]     = useState([])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => { if (currentWorkspace?._id) fetchAll() }, [currentWorkspace?._id])

  const fetchAll = async () => {
    setLoading(true)
    const wid = currentWorkspace._id
    try {
      const [ov, tr, pf] = await Promise.all([
        api.get(`/api/analytics/overview?workspace=${wid}`),
        api.get(`/api/analytics/completion-trend?workspace=${wid}`),
        api.get(`/api/analytics/team-performance?workspace=${wid}`),
      ])
      setOverview(ov.data)
      setTrend(tr.data.trend || [])
      setPerf(pf.data.performance || [])
    } catch {} finally { setLoading(false) }
  }

  const exportCSV = async () => {
    try {
      const res = await api.get(`/api/analytics/export/csv?workspace=${currentWorkspace._id}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'flowdesk-analytics.csv'; a.click()
    } catch { toast.error('Export failed') }
  }

  const COLORS = { todo: '#8891b5', 'in-progress': '#2d5aff', completed: '#10b981' }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Workspace performance insights</p>
          </div>
          <button onClick={exportCSV} className="btn-ghost border border-surface-200 dark:border-surface-700 text-sm gap-2">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Stats row */}
        {!loading && overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks', value: overview.totalTasks || 0 },
              { label: 'Completed', value: overview.completedTasks || 0 },
              { label: 'Overdue', value: overview.overdueTasks || 0 },
              { label: 'Hours Tracked', value: `${(overview.hoursTracked || 0).toFixed(1)}h` },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="text-xs font-semibold text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Completion trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-brand-500" /> Completion Trend (30 days)
          </h3>
          {loading ? <div className="skeleton h-48 rounded-xl" /> : trend.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No trend data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#1e2235', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="completed" stroke="#2d5aff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="created" stroke="#10b981" strokeWidth={2} dot={false} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Team performance */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-brand-500" /> Team Performance
          </h3>
          {loading ? <div className="skeleton h-48 rounded-xl" /> : perf.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No performance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perf}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#1e2235', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="completed" fill="#2d5aff" radius={[4,4,0,0]} />
                <Bar dataKey="total" fill="#e4e7f1" radius={[4,4,0,0]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
