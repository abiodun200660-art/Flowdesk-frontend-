import { Zap } from 'lucide-react'
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center animate-pulse">
        <Zap size={20} className="text-white" />
      </div>
    </div>
  )
}
