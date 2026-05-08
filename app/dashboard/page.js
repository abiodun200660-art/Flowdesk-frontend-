'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines'
import AIWeeklySummary from '@/components/dashboard/AIWeeklySummary'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import {
  CheckSquare, Clock, FolderKanban, TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const { user }               = useAuth()
  const { currentWorkspace }   = useWorkspace()
  const [stats, setStats]      = useState(null)
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    if (!currentWorkspace?._id) return
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(
          '/api/analytics/overview?workspace=${currentWorkspace._id}
        )
        setStats(data)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [currentWorkspace?._id])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    {
      icon: CheckSquare,
      label: 'Tasks Completed',
      value: stats?.completedTasks ?? '—',
      sub: 'this week',
      color: 'bg-emerald-500',
      trend: stats?.completedTrend,
    },
    {
      icon: Clock,
      label: 'Tasks Overdue',
      value: stats?.overdueTasks ?? '—',
      sub: 'need attention',
      color: 'bg-red-500',
    },
    {
      icon: FolderKanban,
      label: 'Active Projects',
      value: stats?.activeProjects ?? '—',
      sub: 'in workspace',
      color: 'bg-brand-500',
    },
    {
      icon: TrendingUp,
      label: 'Hours Tracked',
      value: stats?.hoursTracked ?? '—',
      sub: 'total this week',
      color: 'bg-violet-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {formatDate(new Date(), 'EEEE, MMMM d')} · {currentWorkspace?.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatsCard key={s.label} {...s} loading={loading} />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <UpcomingDeadlines workspaceId={currentWorkspace?._id} />
            <ActivityFeed workspaceId={currentWorkspace?._id} />
          </div>
          <div>
            <AIWeeklySummary workspaceId={currentWorkspace?._id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}