'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card shadow-modal animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
