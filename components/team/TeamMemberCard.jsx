'use client'

import { useState } from 'react'
import { Crown, User, Shield, MoreVertical, Trash2, RefreshCw } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import RoleBadge from '@/components/team/RoleBadge'
import PresenceIndicator from '@/components/team/PresenceIndicator'
import { formatDate } from '@/lib/utils'

export default function TeamMemberCard({
  member,
  currentUserId,
  isAdmin,
  onRemove,
  onRoleChange,
}) {
  const user      = member.user || {}
  const role      = member.role || 'member'
  const isMe      = user._id === currentUserId
  const joinedAt  = member.joinedAt || member.createdAt

  const [changingRole, setChangingRole] = useState(false)

  const handleRoleChange = async (newRole) => {
    if (newRole === role) return
    setChangingRole(true)
    try {
      await onRoleChange(user._id, newRole)
    } finally {
      setChangingRole(false)
    }
  }

  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">

      {/* Avatar + presence */}
      <div className="relative flex-shrink-0">
        <Avatar user={user} size="lg" />
        <PresenceIndicator userId={user._id} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-gray-900 dark:text-white truncate">
            {user.name || 'Unknown'}
          </span>
          {isMe && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold flex-shrink-0">
              You
            </span>
          )}
          <RoleBadge role={role} />
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {user.email || '—'}
        </p>

        {joinedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Joined {formatDate(joinedAt, 'MMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Task count */}
      {member.taskCount !== undefined && (
        <div className="hidden sm:flex flex-col items-center flex-shrink-0">
          <span className="text-lg font-display font-bold text-gray-900 dark:text-white">
            {member.taskCount}
          </span>
          <span className="text-[10px] text-gray-400">tasks</span>
        </div>
      )}

      {/* Completion rate */}
      {member.completionRate !== undefined && (
        <div className="hidden md:flex flex-col items-center flex-shrink-0">
          <span className="text-lg font-display font-bold text-emerald-500">
            {Math.round(member.completionRate)}%
          </span>
          <span className="text-[10px] text-gray-400">done</span>
        </div>
      )}

      {/* Actions — admin only, not for self */}
      {isAdmin && !isMe && (
        <Dropdown
          align="right"
          trigger={
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-800 transition-all flex-shrink-0">
              {changingRole
                ? <RefreshCw size={16} className="animate-spin" />
                : <MoreVertical size={16} />
              }
            </button>
          }
        >
          {/* Role options */}
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Change role
            </p>
          </div>

          <DropdownItem
            icon={<Crown size={14} />}
            onClick={() => handleRoleChange('admin')}
            disabled={role === 'admin'}
          >
            <span className="flex items-center justify-between w-full gap-4">
              Admin
              {role === 'admin' && (
                <span className="text-[10px] text-brand-500 font-bold">Current</span>
              )}
            </span>
          </DropdownItem>

          <DropdownItem
            icon={<User size={14} />}
            onClick={() => handleRoleChange('member')}
            disabled={role === 'member'}
          >
            <span className="flex items-center justify-between w-full gap-4">
              Member
              {role === 'member' && (
                <span className="text-[10px] text-brand-500 font-bold">Current</span>
              )}
            </span>
          </DropdownItem>

          <DropdownItem
            icon={<Shield size={14} />}
            onClick={() => handleRoleChange('viewer')}
            disabled={role === 'viewer'}
          >
            <span className="flex items-center justify-between w-full gap-4">
              Viewer
              {role === 'viewer' && (
                <span className="text-[10px] text-brand-500 font-bold">Current</span>
              )}
            </span>
          </DropdownItem>

          {/* Remove */}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <DropdownItem
              icon={<Trash2 size={14} />}
              onClick={() => onRemove(user._id)}
              danger
            >
              Remove member
            </DropdownItem>
          </div>
        </Dropdown>
      )}
    </div>
  )
}