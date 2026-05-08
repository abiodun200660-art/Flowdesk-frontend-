'use client'

import { useEffect, useState } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import { CheckSquare, Clock, FolderKanban, TrendingUp, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'

export default function WidgetGrid() {
  const { currentWorkspace }  = useWorkspace()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!currentWorkspace?._id) return
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(
          `/api/analytics/overview?workspace=${currentWorkspace._id}`
        )
        setStats(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [currentWorkspace?._id])

  const cards = [
    {
      icon:  CheckSquare,
      label: 'Tasks Completed',
      value: stats?.completedTasks ?? '—',
      sub:   'this week',
      color: 'bg-emerald-500',
      trend: stats?.completedTrend,
    },
    {
      icon:  Clock,
      label: 'Tasks Overdue',
      value: stats?.overdueTasks ?? '—',
      sub:   'need attention',
      color: 'bg-red-500',
      trend: stats?.overdueTrend,
    },
    {
      icon:  FolderKanban,
      label: 'Active Projects',
      value: stats?.activeProjects ?? '—',
      sub:   'in workspace',
      color: 'bg-brand-500',
      trend: stats?.projectTrend,
    },
    {
      icon:  TrendingUp,
      label: 'Hours Tracked',
      value: stats?.hoursTracked ?? '—',
      sub:   'total this week',
      color: 'bg-violet-500',
      trend: stats?.hoursTrend,
    },
  ]

  if (error) {
    return (
      <div className="col-span-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
        <AlertCircle size={16} />
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatsCard
          key={card.label}
          icon={card.icon}
          label={card.label}
          value={card.value}
          sub={card.sub}
          color={card.color}
          trend={card.trend}
          loading={loading}
        />
      ))}
    </div>
  )
}