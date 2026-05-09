'use client'

import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-50 dark:bg-surface-950">
      <h1 className="font-display text-7xl font-bold text-brand-500">404</h1>
      <p className="text-gray-500 dark:text-gray-400">This page doesn't exist.</p>
      <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  )
}
