'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Layers, FolderOpen,
  BarChart2, Clock, Settings
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/tasks',     icon: Layers,          label: 'Tasks' },
  { href: '/dashboard/projects',  icon: FolderOpen,      label: 'Projects' },
  { href: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics' },
  { href: '/dashboard/time',      icon: Clock,           label: 'Time' },
  { href: '/dashboard/settings',  icon: Settings,        label: 'Settings' },
]

export default function MobileNav() {
  const pathname = usePathname()

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 flex items-center justify-around px-2 py-2 md:hidden">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
              active
                ? 'text-brand-500'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}