import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'

export default function useProjects() {
  const { currentWorkspace } = useWorkspace()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchProjects = useCallback(async () => {
    if (!currentWorkspace?._id) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(
        /api/projects?workspace=${currentWorkspace._id}
      )
      setProjects(data.projects || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [currentWorkspace?._id])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (payload) => {
    const { data } = await api.post('/api/projects', {
      ...payload,
      workspace: currentWorkspace._id,
    })
    setProjects((prev) => [data.project, ...prev])
    return data.project
  }

  const updateProject = async (id, payload) => {
    const { data } = await api.put(/api/projects/${id}, payload)
    setProjects((prev) =>
      prev.map((p) => (p._id === id ? data.project : p))
    )
    return data.project
  }

  const deleteProject = async (id) => {
    await api.delete(/api/projects/${id})
    setProjects((prev) => prev.filter((p) => p._id !== id))
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}