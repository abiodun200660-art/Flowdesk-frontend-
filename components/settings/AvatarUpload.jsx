'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Camera, Trash2, Upload, Loader2, User } from 'lucide-react'
import { getInitials, stringToColor } from '@/lib/utils'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB — matches backend multer limit
const ACCEPTED       = ['image/jpeg', 'image/png', 'image/webp']

export default function AvatarUpload({ size = 80 }) {
  const { user, updateUser } = useAuth()
  const inputRef = useRef(null)

  const [preview,   setPreview]   = useState(null)   // local blob URL while uploading
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing,  setRemoving]  = useState(false)

  // ── validation ─────────────────────────────────────────────────────────────
  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Only JPG, PNG or WebP images are allowed')
      return false
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be under 2 MB')
      return false
    }
    return true
  }

  // ── upload to POST /api/users/avatar ───────────────────────────────────────
  const upload = useCallback(async (file) => {
    if (!validate(file)) return

    // show instant preview
    const blobUrl = URL.createObjectURL(file)
    setPreview(blobUrl)
    setUploading(true)

    try {
      const form = new FormData()
      form.append('avatar', file)

      const { data } = await api.post('/api/users/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      updateUser({ avatar: data.avatar })
      setPreview(null)            // let the real URL from server take over
      URL.revokeObjectURL(blobUrl)
      toast.success('Profile photo updated')
    } catch (err) {
      setPreview(null)
      URL.revokeObjectURL(blobUrl)
      toast.error(err.response?.data?.message || 'Upload failed — please try again')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [updateUser])

  // ── remove avatar ──────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!user?.avatar) return
    if (!confirm('Remove your profile photo?')) return
    setRemoving(true)
    try {
      const { data } = await api.put('/api/users/profile', { avatar: '' })
      updateUser({ avatar: '' })
      toast.success('Profile photo removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove photo')
    } finally {
      setRemoving(false)
    }
  }

  // ── file input change ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  // ── drag & drop ────────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = ()    => setDragging(false)

  // ── derived ────────────────────────────────────────────────────────────────
  const avatarSrc  = preview || user?.avatar || null
  const initials   = getInitials(user?.name || '')
  const bgColor    = stringToColor(user?.name || '')
  const busy       = uploading || removing

  return (
    <div className="flex items-center gap-5">

      {/* ── Avatar circle ── */}
      <div className="relative flex-shrink-0 group">
        {/* Drop zone wrapper */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !busy && inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200
            ${dragging ? 'ring-2 ring-brand-400 ring-offset-2 scale-105' : ''}
            ${busy     ? 'cursor-not-allowed' : 'hover:ring-2 hover:ring-brand-300 hover:ring-offset-2'}
          `}
          style={{ width: size, height: size }}
          title="Click or drop an image to change your photo"
        >
          {/* Avatar image or initials */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user?.name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold select-none"
              style={{ background: bgColor, fontSize: size * 0.32 }}
            >
              {initials || <User size={size * 0.38} />}
            </div>
          )}

          {/* Overlay on hover / busy */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1
            bg-black/50 transition-opacity duration-150
            ${busy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            {uploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <>
                <Camera size={18} className="text-white" />
                <span className="text-[10px] font-semibold text-white">
                  {dragging ? 'Drop' : 'Change'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Drag indicator ring */}
        {dragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-brand-400 pointer-events-none animate-pulse" />
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={handleFileChange}
          disabled={busy}
        />
      </div>

      {/* ── Text + actions ── */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user?.name || 'Your name'}
          </p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {/* Upload button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              border border-surface-200 dark:border-surface-700
              bg-white dark:bg-surface-800
              text-gray-700 dark:text-gray-300
              hover:bg-surface-50 dark:hover:bg-surface-750
              hover:border-brand-300 dark:hover:border-brand-600
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? <Loader2 size={11} className="animate-spin" />
              : <Upload size={11} />
            }
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>

          {/* Remove button — only shown when avatar exists */}
          {(user?.avatar || preview) && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                border border-surface-200 dark:border-surface-700
                bg-white dark:bg-surface-800
                text-red-500 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                hover:border-red-300 dark:hover:border-red-800
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removing
                ? <Loader2 size={11} className="animate-spin" />
                : <Trash2 size={11} />
              }
              {removing ? 'Removing…' : 'Remove'}
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-[11px] text-gray-400 leading-snug">
          JPG, PNG or WebP · Max 2 MB · Click the avatar or drag & drop
        </p>
      </div>
    </div>
  )
}