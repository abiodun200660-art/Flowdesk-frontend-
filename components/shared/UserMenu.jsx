'use client'
import { useState } from 'react'
import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getInitials, stringToColor } from '@/lib/utils'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen]  = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 p-1.5 transition-all"
      >
        {user.avatar ? (
          <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: stringToColor(user.name) }}
          >
            {getInitials(user.name)}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-50 w-48 py-1.5 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-xl">
            <div className="px-3.5 py-2.5 border-b border-surface-100 dark:border-surface-800 mb-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}