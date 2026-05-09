'use client'

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-100 dark:bg-surface-800 text-gray-600 dark:text-gray-400',
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }
  return <span className={`badge ${variants[variant] || variants.default} ${className}`}>{children}</span>
}
