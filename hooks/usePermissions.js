'use client'

import useAuth from '@/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'

export default function usePermissions() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()

  const membership = currentWorkspace?.members?.find(
    (m) => m.user?._id === user?._id || m.user === user?._id
  )

  const role    = membership?.role || 'viewer'
  const isAdmin = role === 'admin' || user?.role === 'admin'
  const isMember = role === 'member' || isAdmin
  const isViewer = role === 'viewer'

  const can = {
    createTask:      isMember,
    editTask:        isMember,
    deleteTask:      isAdmin,
    createProject:   isAdmin,
    editProject:     isAdmin,
    deleteProject:   isAdmin,
    inviteMember:    isAdmin,
    removeMember:    isAdmin,
    editWorkspace:   isAdmin,
    deleteWorkspace: isAdmin,
    viewAnalytics:   isMember,
    exportReports:   isAdmin,
    logTime:         isMember,
    manageSettings:  isAdmin,
  }

  return { role, isAdmin, isMember, isViewer, can }
}