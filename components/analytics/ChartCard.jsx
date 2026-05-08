'use client'

import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function ChartCard({
  title,
  subtitle,
  children,
  loading,
  action,
  className = '',
}) {
  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-3">
            {action}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`px-5 py-4 ${className}`}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
