'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useWorkspace } from '@/context/WorkspaceContext'

export default function useTasks(filters = {}) {
  const { currentWorkspace } = useWorkspace()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!currentWorkspace?._id) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        workspace: currentWorkspace._id,
        ...filters,
      })
      const { data } = await api.get(`/api/tasks?${params}`)
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [currentWorkspace?._id, JSON.stringify(filters)])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Real-time updates
  useEffect(() => {
    const socket = getSocket()
    const onCreated = (t) => setTasks((prev) => [t, ...prev])
    const onUpdated = (t) => setTasks((prev) => prev.map((x) => x._id === t._id ? t : x))
    const onDeleted = ({ taskId }) => setTasks((prev) => prev.filter((x) => x._id !== taskId))

    socket.on('task:created', onCreated)
    socket.on('task:updated', onUpdated)
    socket.on('task:deleted', onDeleted)

    return () => {
      socket.off('task:created', onCreated)
      socket.off('task:updated', onUpdated)
      socket.off('task:deleted', onDeleted)
    }
  }, [])

  const createTask = async (payload) => {
    const { data } = await api.post('/api/tasks', {
      ...payload,
      workspace: currentWorkspace._id,
    })
    setTasks((prev) => [data.task, ...prev])
    return data.task
  }

  const updateTask = async (id, payload) => {
    const { data } = await api.put(`/api/tasks/${id}`, payload)
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)))
    return data.task
  }

  const deleteTask = async (id) => {
    await api.delete(`/api/tasks/${id}`)
    setTasks((prev) => prev.filter((t) => t._id !== id))
  }

  const updateStatus = async (id, status) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)))
    try {
      await api.put(`/api/tasks/${id}`, { status })
    } catch {
      fetchTasks()
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    refetch: fetchTasks,
  }
}