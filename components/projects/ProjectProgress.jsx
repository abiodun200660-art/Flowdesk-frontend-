'use client'

export default function ProjectProgress({ percentage = 0, color = '#2d5aff', showLabel = true }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)))

  const getStatusLabel = () => {
    if (clamped === 0)   return 'Not started'
    if (clamped < 25)    return 'Just started'
    if (clamped < 50)    return 'In progress'
    if (clamped < 75)    return 'Halfway there'
    if (clamped < 100)   return 'Almost done'
    return 'Completed'
  }

  const getTrackColor = () => {
    if (clamped === 100) return 'bg-emerald-500/20'
    return 'bg-gray-100 dark:bg-surface-700'
  }

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {getStatusLabel()}
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: clamped === 100 ? '#10b981' : color }}
          >
            {clamped}%
          </span>
        </div>
      )}

      {/* Track */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${getTrackColor()}`}>
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:           `${clamped}%`,
            backgroundColor: clamped === 100 ? '#10b981' : color,
          }}
        />
      </div>
    </div>
  )
}