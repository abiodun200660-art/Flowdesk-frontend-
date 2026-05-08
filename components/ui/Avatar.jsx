import { getInitials, stringToColor } from '@/lib/utils'
export default function Avatar({ user, size = 32, className = '' }) {
  const s = `${size}px`
  if (user?.avatar) return <img src={user.avatar} style={{ width: s, height: s }} className={`rounded-full object-cover ${className}`} alt="" />
  return (
    <div style={{ width: s, height: s, background: stringToColor(user?.name || ''), fontSize: size * 0.35 }}
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {getInitials(user?.name || '')}
    </div>
  )
}
