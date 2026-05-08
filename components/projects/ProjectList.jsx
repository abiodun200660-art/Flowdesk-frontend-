'use client'

import ProjectCard from '@/components/projects/ProjectCard'
import EmptyState from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import { FolderKanban, Plus } from 'lucide-react'

export default function ProjectList({ projects = [], loading, onEdit, onDelete }) {

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4"
          >
            {/* Top row */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            {/* Description */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            {/* Progress */}
            <Skeleton className="h-2 w-full rounded-full" />
            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!projects.length) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to start organising tasks and tracking progress."
        action={
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
          >
            <Plus size={15} /> Create project
          </button>
        }
      />
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}