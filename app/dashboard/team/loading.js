'use client'

import { Zap } from 'lucide-react'
export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  )
}
