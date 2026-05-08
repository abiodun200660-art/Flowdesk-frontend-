import { Crown, User, Shield } from 'lucide-react'

const ROLES = {
  admin: {
    label:   'Admin',
    icon:    Crown,
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  member: {
    label:   'Member',
    icon:    User,
    className: 'bg-brand-500/15 text-brand-600 dark:text-brand-400',
  },
  viewer: {
    label:   'Viewer',
    icon:    Shield,
    className: 'bg-gray-100 text-gray-600 dark:bg-surface-700 dark:text-gray-400',
  },
}

export default function RoleBadge({ role = 'member' }) {
  const config  = ROLES[role] || ROLES.member
  const Icon    = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${config.className}`}
    >
      <Icon size={10} />
      {config.label}
    </span>
  )
}