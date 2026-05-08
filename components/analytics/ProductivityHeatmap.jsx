'use client'

import { useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import { eachDayOfInterval, subDays, startOfDay } from 'date-fns'

const LEVELS = [
  { min: 0,  max: 0,  bg: 'bg-gray-100 dark:bg-surface-700',        label: 'No activity'  },
  { min: 1,  max: 2,  bg: 'bg-emerald-200 dark:bg-emerald-900/50',  label: '1–2 tasks'    },
  { min: 3,  max: 5,  bg: 'bg-emerald-300 dark:bg-emerald-700/60',  label: '3–5 tasks'    },
  { min: 6,  max: 9,  bg: 'bg-emerald-400 dark:bg-emerald-600',     label: '6–9 tasks'    },
  { min: 10, max: Infinity, bg: 'bg-emerald-500 dark:bg-emerald-500', label: '10+ tasks'  },
]

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getLevel(count) {
  return LEVELS.find((l) => count >= l.min && count <= l.max) || LEVELS[0]
}

export default function ProductivityHeatmap({ data = [] }) {
  const today = startOfDay(new Date())

  // Build a map of date -> count from API data
  const countMap = useMemo(() => {
    const map = {}
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.date) map[item.date.slice(0, 10)] = item.count || item.completed || 0
      })
    }
    return map
  }, [data])

  // Generate last 52 weeks of days (364 days)
  const allDays = useMemo(() => {
    const start = subDays(today, 363)
    return eachDayOfInterval({ start, end: today })
  }, [])

  // Group into weeks (columns)
  const weeks = useMemo(() => {
    const result = []
    let week     = []
    allDays.forEach((day) => {
      week.push(day)
      if (day.getDay() === 6) {
        result.push(week)
        week = []
      }
    })
    if (week.length) result.push(week)
    return result
  }, [allDays])

  // Month labels — track which week each month starts in
  const monthLabels = useMemo(() => {
    const labels = []
    weeks.forEach((week, wi) => {
      week.forEach((day) => {
        if (day.getDate() <= 7) {
          // Only add if not already added for this month
          const last = labels[labels.length - 1]
          if (!last || last.month !== day.getMonth()) {
            labels.push({ month: day.getMonth(), weekIndex: wi })
          }
        }
      })
    })
    return labels
  }, [weeks])

  const totalCompleted = Object.values(countMap).reduce((a, b) => a + b, 0)
  const activeDays     = Object.values(countMap).filter((v) => v > 0).length

  return (
    <div className="space-y-4">

      {/* Summary */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex flex-col">
          <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {totalCompleted}
          </span>
          <span className="text-xs text-gray-400">tasks completed</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {activeDays}
          </span>
          <span className="text-xs text-gray-400">active days</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {weeks.length}
          </span>
          <span className="text-xs text-gray-400">weeks tracked</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">

          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi)
              return (
                <div key={wi} className="flex-shrink-0" style={{ width: '14px', marginRight: '2px' }}>
                  {label && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {MONTHS[label.month]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day rows + cells */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className="flex items-center justify-end"
                  style={{ height: '14px' }}
                >
                  {i % 2 === 1 && (
                    <span className="text-[10px] text-gray-400 pr-1">{d}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {/* Pad top if week doesn't start on Sunday */}
                  {wi === 0 && week[0].getDay() > 0 && (
                    Array(week[0].getDay()).fill(0).map((_, pi) => (
                      <div key={`pad-${pi}`} style={{ width: '12px', height: '12px' }} />
                    ))
                  )}
                  {week.map((day) => {
                    const key   = formatDate(day, 'yyyy-MM-dd')
                    const count = countMap[key] || 0
                    const level = getLevel(count)
                    const isToday = day.toDateString() === today.toDateString()

                    return (
                      <div
                        key={key}
                        title={`${formatDate(day, 'MMM d, yyyy')} · ${count} task${count !== 1 ? 's' : ''} completed`}
                        className={`rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10 relative ${level.bg} ${isToday ? 'ring-1 ring-brand-500 ring-offset-1' : ''}`}
                        style={{ width: '12px', height: '12px' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-gray-400">Less</span>
            {LEVELS.map((level) => (
              <div
                key={level.label}
                title={level.label}
                className={`w-3 h-3 rounded-sm ${level.bg}`}
              />
            ))}
            <span className="text-[10px] text-gray-400">More</span>
          </div>

        </div>
      </div>
    </div>
  )
}