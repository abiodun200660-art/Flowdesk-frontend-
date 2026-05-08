'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useTheme } from '@/context/ThemeContext'
import {
  Zap, LayoutDashboard, Layers, FolderOpen, Users, BarChart2,
  Clock, Settings, Menu, X, Sun, Moon, WifiOff
} from 'lucide-react'
import { getInitials, stringToColor } from '@/lib/utils'
import NotificationBell from './NotificationBell'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import CommandPalette from './CommandPalette'

const NAV = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/tasks',      icon: Layers,          label: 'Tasks' },
  { href: '/dashboard/projects',   icon: FolderOpen,      label: 'Projects' },
  { href: '/dashboard/team',       icon: Users,           label: 'Team' },
  { href: '/dashboard/analytics',  icon: BarChart2,       label: 'Analytics' },
  { href: '/dashboard/time',       icon: Clock,           label: 'Time' },
  { href: '/dashboard/settings',   icon: Settings,        label: 'Settings' },
]

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth()
  const { currentWorkspace }      = useWorkspace()
  const { theme, toggleTheme }    = useTheme()
  const router   = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cmdOpen, setCmdOpen]         = useState(false)
  const [online, setOnline]           = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true) } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center animate-pulse">
          <Zap size={20} className="text-white" />
        </div>
      </div>
    )
  }

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-surface-200 dark:border-surface-800 flex-shrink-0">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-display font-bold text-gray-900 dark:text-white">FlowDesk</span>
        <button className="ml-auto md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>

      {/* Workspace */}
      <div className="px-3 py-3 border-b border-surface-200 dark:border-surface-800">
        <WorkspaceSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            onClick={() => setSidebarOpen(false)}
            className={`nav-link ${isActive(href) ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {user.avatar ? (
            <img src={user.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: stringToColor(user.name) }}>
              {getInitials(user.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 bg-white dark:bg-surface-900 animate-fade-in">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center gap-3 px-4">
          <button className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <NotificationBell workspaceId={currentWorkspace?._id} />
            {user.avatar ? (
              <img src={user.avatar} className="w-7 h-7 rounded-full object-cover ml-1" alt="" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1"
                style={{ background: stringToColor(user.name) }}>
                {getInitials(user.name)}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {!online && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-full shadow-lg animate-slide-up">
          <WifiOff size={14} /> Offline — changes will sync when reconnected
        </div>
      )}
    </div>
  )
}
