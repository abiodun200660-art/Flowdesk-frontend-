'use client'

import { useMemo } from 'react'
import GanttBar from '@/components/projects/GanttBar'
import { formatDate } from '@/lib/utils'
import { addDays, eachDayOfInterval, startOfDay, parseISO } from 'date-fns'

export default function GanttView({ projects = [], loading }) {
  const today = startOfDay(new Date())

  // Compute the date bounds from all projects
  const { startBound, endBound, totalDays, days } = useMemo(() => {
    const dates = projects.flatMap((p) => [
      p.startDate ? new Date(p.startDate) : today,
      p.deadline  ? new Date(p.deadline)  : addDays(today, 30),
    ])

    const earliest = dates.length
      ? new Date(Math.min(...dates.map((d) => d.getTime())))
      : today
    const latest = dates.length
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : addDays(today, 60)

    const start = addDays(earliest, -3)
    const end   = addDays(latest,    5)

    const dayList = eachDayOfInterval({ start, end })

    return {
      startBound: start,
      endBound:   end,
      totalDays:  dayList.length,
      days:       dayList,
    }
  }, [projects])

  // Today marker position
  const todayOffset = Math.max(
    0,
    Math.floor((today - startBound) / (1000 * 60 * 60 * 24))
  )
  const todayPercent = (todayOffset / totalDays) * 100

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(4).fill(0).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-2xl bg-gray-200 dark:bg-surface-800 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!projects.length) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500 text-sm">
        No projects to display on Gantt chart.
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="flex">

        {/* Left: project names */}
        <div className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="h-10 px-4 flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Project
            </span>
          </div>
          {/* Rows */}
          {projects.map((project) => (
            <div
              key={project._id}
              className="h-14 px-4 flex items-center border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || '#2d5aff' }}
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {project.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: timeline */}
        <div className="flex-1 overflow-x-auto">
          {/* Day headers */}
          <div className="h-10 flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-800 relative">
            {days.map((day, i) => {
              const isFirst    = i === 0
              const isMonday   = day.getDay() === 1
              const isToday    = day.toDateString() === today.toDateString()
              const showLabel  = isFirst || isMonday || days.length <= 14

              return (
                <div
                  key={day.toISOString()}
                  className={`flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex items-center justify-center ${isToday ? 'bg-brand-500/10' : ''}`}
                  style={{ width: `${100 / totalDays}%`, minWidth: '28px' }}
                >
                  {showLabel && (
                    <span className={`text-[10px] font-medium ${isToday ? 'text-brand-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                      {formatDate(day, days.length > 60 ? 'MMM d' : 'd')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Project bar rows */}
          {projects.map((project) => (
            <div
              key={project._id}
              className="h-14 border-b border-gray-100 dark:border-gray-800 last:border-0 relative"
            >
              {/* Day grid lines */}
              {days.map((day, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-r border-gray-100 dark:border-gray-800"
                  style={{ left: `${(i / totalDays) * 100}%`, width: `${100 / totalDays}%` }}
                />
              ))}

              {/* Today marker */}
              <div
                className="absolute top-0 h-full w-px bg-brand-500/50 z-10"
                style={{ left: `${todayPercent}%` }}
              />

              {/* Gantt bar */}
              {(project.startDate || project.deadline) && (
                <GanttBar
                  project={project}
                  startBound={startBound}
                  totalDays={totalDays}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-px h-4 bg-brand-500/50" />
          Today
        </div>
        {[
          { label: 'Active',    color: '#2d5aff' },
          { label: 'Completed', color: '#10b981' },
          { label: 'On Hold',   color: '#f59e0b' },
          { label: 'Cancelled', color: '#f43f5e' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color + '66', border: `1.5px solid ${item.color}` }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}