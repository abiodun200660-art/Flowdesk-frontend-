'use client'
import { useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus } from 'lucide-react'
import { stringToColor } from '@/lib/utils'

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: stringToColor(currentWorkspace?.name || 'W') }}>
          {(currentWorkspace?.name || 'W')[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 text-left">
          {currentWorkspace?.name || 'My Workspace'}
        </span>
        <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-modal overflow-hidden z-50">
          {workspaces.map(ws => (
            <button key={ws._id}
              onClick={() => { switchWorkspace(ws); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors ${currentWorkspace?._id === ws._id ? 'text-brand-600 dark:text-brand-400 bg-brand-500/5' : 'text-gray-700 dark:text-gray-300'}`}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: stringToColor(ws.name) }}>
                {ws.name[0].toUpperCase()}
              </div>
              {ws.name}
            </button>
          ))}
          <button onClick={() => { setOpen(false); router.push('/dashboard/settings') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-500 hover:bg-brand-500/5 border-t border-surface-200 dark:border-surface-700 transition-colors">
            <Plus size={14} /> New workspace
          </button>
        </div>
      )}
    </div>
  )
}
