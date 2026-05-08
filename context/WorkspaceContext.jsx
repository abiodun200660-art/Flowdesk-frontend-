'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { joinWorkspace, leaveWorkspace } from '@/lib/socket'
import { useAuth } from '@/context/AuthContext'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces]           = useState([])
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [loading, setLoading]                 = useState(false)

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get('/api/workspaces')
      const list = data.workspaces || []
      setWorkspaces(list)

      const savedId = localStorage.getItem('flowdesk-workspace')
      const active  = list.find((w) => w._id === savedId) || list[0]
      if (active) {
        setCurrentWorkspace(active)
        joinWorkspace(active._id)
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const switchWorkspace = (workspace) => {
    if (currentWorkspace?._id) leaveWorkspace(currentWorkspace._id)
    setCurrentWorkspace(workspace)
    localStorage.setItem('flowdesk-workspace', workspace._id)
    joinWorkspace(workspace._id)
  }

  const addWorkspace = (ws) => {
    setWorkspaces((prev) => [...prev, ws])
    switchWorkspace(ws)
  }

  const updateWorkspace = (updated) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === updated._id ? updated : w))
    )
    if (currentWorkspace?._id === updated._id) {
      setCurrentWorkspace(updated)
    }
  }

  const removeWorkspace = (id) => {
    setWorkspaces((prev) => prev.filter((w) => w._id !== id))
    if (currentWorkspace?._id === id) {
      const remaining = workspaces.filter((w) => w._id !== id)
      if (remaining.length > 0) switchWorkspace(remaining[0])
      else setCurrentWorkspace(null)
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        switchWorkspace,
        addWorkspace,
        updateWorkspace,
        removeWorkspace,
        refetch: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}