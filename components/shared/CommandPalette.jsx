'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Layers, FolderOpen, Users, BarChart2, Clock, Settings, X } from 'lucide-react'

const COMMANDS = [
  { label: 'Overview',     icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Tasks',        icon: Layers,          href: '/dashboard/tasks' },
  { label: 'Projects',     icon: FolderOpen,      href: '/dashboard/projects' },
  { label: 'Team',         icon: Users,           href: '/dashboard/team' },
  { label: 'Analytics',    icon: BarChart2,       href: '/dashboard/analytics' },
  { label: 'Time Tracking',icon: Clock,           href: '/dashboard/time' },
  { label: 'Settings',     icon: Settings,        href: '/dashboard/settings' },
]

export default function CommandPalette({ open, onClose }) {
  const router = useRouter()
  const [q, setQ] = useState('')

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))

  useEffect(() => { if (open) setQ('') }, [open])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card shadow-modal animate-slide-up overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-800">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search or navigate…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={15} /></button>
        </div>
        <div className="max-h-64 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-6">No results</p>
          ) : filtered.map(({ label, icon: Icon, href }) => (
            <button key={href} onClick={() => { router.push(href); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-brand-500/5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <Icon size={15} className="text-gray-400" />
              {label}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-surface-100 dark:border-surface-800 text-xs text-gray-400 flex gap-3">
          <span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>
  )
}
