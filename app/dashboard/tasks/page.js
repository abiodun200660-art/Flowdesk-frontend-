'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import TaskModal from '@/components/tasks/TaskModal'
import AITaskGenerator from '@/components/tasks/AITaskGenerator'
import TaskFilters from '@/components/tasks/TaskFilters'
import { Plus, Sparkles } from 'lucide-react'
import useTasks from '@/hooks/useTasks'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function TasksPage() {
  const searchParams              = useSearchParams()
  const [filters, setFilters]     = useState({})
  const { tasks, loading, updateStatus, createTask, updateTask, deleteTask } = useTasks(filters)
  const [selectedTask, setSelected] = useState(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [aiOpen, setAIOpen]         = useState(false)

  // Open task or new-task from URL
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSelected(null)
      setModalOpen(true)
    }
  }, [searchParams])

  const handleTaskClick = (task) => {
    setSelected(task)
    setModalOpen(true)
  }

  const handleSave = async (payload) => {
    if (selectedTask) {
      await updateTask(selectedTask._id, payload)
    } else {
      await createTask(payload)
    }
    setModalOpen(false)
    setSelected(null)
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setModalOpen(false)
    setSelected(null)
  }

  const handleAIGenerated = (newTasks) => {
    setAIOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <TaskFilters filters={filters} onChange={setFilters} />
            <button
              onClick={() => setAIOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
            >
              <Sparkles size={15} className="text-brand-500" />
              AI Generate
            </button>
            <button
              onClick={() => { setSelected(null); setModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Board */}
        <KanbanBoard
          tasks={tasks}
          loading={loading}
          onTaskClick={handleTaskClick}
          onStatusChange={updateStatus}
        />
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        task={selectedTask}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <AITaskGenerator
        open={aiOpen}
        onClose={() => setAIOpen(false)}
        onGenerated={handleAIGenerated}
      />
    </DashboardLayout>
  )
}