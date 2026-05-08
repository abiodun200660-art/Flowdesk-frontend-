'use client'

import { useState } from 'react'
import { Folder, Calendar, MoreVertical, Edit2, Trash2, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatRelative, formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import ProjectProgress from '@/components/projects/ProjectProgress'
import usePermissions from '@/hooks/usePermissions'

// ── Inline AvatarGroup (Avatar.jsx has no named export for it) ────────────────
function AvatarGroup({ users = [], max = 3, size = 24 }) {
  const shown = users.slice(0, max)
  const extra = users.length - max
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((u, i) => (
        <div key={u?._id || i} className="ring-2 ring-white dark:ring-surface-850 rounded-full">
          <Avatar user={u} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="ring-2 ring-white dark:ring-surface-850 rounded-full flex items-center justify-center bg-surface-200 dark:bg-surface-700 text-gray-600 dark:text-gray-300 font-semibold"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}

// ── Inline Dropdown (avoids named-export mismatch) ────────────────────────────
function CardMenu({ onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-800 transition-all flex-shrink-0"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-xl shadow-modal overflow-hidden">
            <button
              onClick={() => { onEdit(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <Edit2 size={13} className="text-gray-400" />
              Edit project
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false) }}
              disabled={deleting}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} />
              {deleting ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectCard({ project, onEdit, onDelete }) {
  const { isAdmin } = usePermissions()
  const [deleting, setDeleting] = useState(false)

  const statusVariant = {
    active:     'brand',
    completed:  'success',
    'on-hold':  'warning',
    cancelled:  'danger',
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await onDelete(project._id)
    } finally {
      setDeleting(false)
    }
  }

  const isOverdue =
    project.deadline &&
    new Date(project.deadline) < new Date() &&
    project.status !== 'completed'

  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4">

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: (project.color || '#2d5aff') + '22' }}
          >
            <Folder size={20} style={{ color: project.color || '#2d5aff' }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-gray-900 dark:text-white truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={statusVariant[project.status] || 'default'}>
                {project.status || 'active'}
              </Badge>
              {isOverdue && <Badge variant="danger">Overdue</Badge>}
            </div>
          </div>
        </div>

        {isAdmin && (
          <CardMenu
            onEdit={() => onEdit(project)}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <ProjectProgress
        percentage={project.completionPercentage || 0}
        color={project.color || '#2d5aff'}
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />
          {project.startDate && project.deadline ? (
            <span>
              {formatDate(project.startDate, 'MMM d')} → {formatDate(project.deadline, 'MMM d, yyyy')}
            </span>
          ) : project.deadline ? (
            <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
              Due {formatRelative(project.deadline)}
            </span>
          ) : (
            <span>No deadline</span>
          )}
        </div>

        {/* Members */}
        {project.members?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-gray-400" />
            <AvatarGroup
              users={project.members.map((m) => m.user || m)}
              max={3}
              size={24}
            />
          </div>
        )}
      </div>
    </div>
  )
}