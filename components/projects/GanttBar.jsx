'use client'

import { formatDate } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

export default function GanttBar({ project, startBound, totalDays }) {
  const projectStart  = project.startDate ? new Date(project.startDate) : new Date()
  const projectEnd    = project.deadline  ? new Date(project.deadline)  : new Date()
  const boundStart    = new Date(startBound)

  const offsetDays    = Math.max(0, Math.floor((projectStart - boundStart) / (1000 * 60 * 60 * 24)))
  const durationDays  = Math.max(1, Math.floor((projectEnd - projectStart)  / (1000 * 60 * 60 * 24)))

  const leftPercent   = (offsetDays / totalDays) * 100
  const widthPercent  = Math.min((durationDays / totalDays) * 100, 100 - leftPercent)

  const completion    = project.completionPercentage || 0

  const statusColors = {
    active:     project.color || '#2d5aff',
    completed:  '#10b981',
    'on-hold':  '#f59e0b',
    cancelled:  '#f43f5e',
  }
  const barColor = statusColors[project.status]  project.color  '#2d5aff'

  return (
    <Tooltip
      content={${project.name} · ${formatDate(project.startDate)} → ${formatDate(project.deadline)} · ${Math.round(completion)}% done}
      side="top"
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 h-7 rounded-lg flex items-center overflow-hidden cursor-pointer group transition-all hover:brightness-110 hover:shadow-md"
        style={{
          left:            ${leftPercent}%,
          width:           ${widthPercent}%,
          backgroundColor: barColor + '33',
          border:          1.5px solid ${barColor},
          minWidth:        '40px',
        }}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-lg transition-all duration-500"
          style={{
            width:           ${completion}%,
            backgroundColor: barColor + '66',
          }}
        />

        {/* Label */}
        <span
          className="relative z-10 px-2 text-xs font-semibold truncate"
          style={{ color: barColor }}
        >
          {project.name}
        </span>

        {/* Completion % badge — shows on hover */}
        <span
          className="relative z-10 ml-auto px-1.5 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ color: barColor }}
        >
          {Math.round(completion)}%
        </span>
      </div>
    </Tooltip>
  )
}