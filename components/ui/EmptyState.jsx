'use client'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-gray-200 dark:text-gray-700 mb-4" />}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      {action}
    </div>
  )
}
