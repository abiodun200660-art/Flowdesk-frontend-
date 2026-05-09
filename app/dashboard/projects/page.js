'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import ProjectCard from '@/components/projects/ProjectCard'
import ProjectModal from '@/components/projects/ProjectModal'
import { Plus, FolderOpen } from 'lucide-react'
import api from '@/lib/api'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const { currentWorkspace } = useWorkspace()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)

  useEffect(() => { if (currentWorkspace?._id) fetchProjects() }, [currentWorkspace?._id])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/projects?workspace=${currentWorkspace._id}`)
      setProjects(data.projects || [])
    } catch {} finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setProjects(prev => prev.filter(p => p._id !== id))
      toast.success('Project deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setEditing(null); setModal(true) }} className="btn-primary">
            <Plus size={15} /> New Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-sm text-gray-400 mb-4">Create your first project to get started</p>
            <button onClick={() => setModal(true)} className="btn-primary">Create project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p}
                onClick={() => {}}
                onEdit={() => { setEditing(p); setModal(true) }}
                onDelete={() => handleDelete(p._id)} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ProjectModal project={editing} onClose={() => { setModal(false); setEditing(null) }}
          onSave={(p) => {
            if (editing) setProjects(prev => prev.map(x => x._id === p._id ? p : x))
            else setProjects(prev => [p, ...prev])
          }} />
      )}
    </DashboardLayout>
  )
}
