"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import AITaskGenerator from "./AITaskGenerator";
import TaskFilters from "./TaskFilters";
import useTasks from "@/hooks/useTasks";
import { useWorkspace } from "@/context/WorkspaceContext";

const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    color: "bg-gray-100 dark:bg-gray-800",
    dot: "bg-gray-400",
    textColor: "text-gray-600 dark:text-gray-400",
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "bg-blue-50 dark:bg-blue-900/10",
    dot: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "completed",
    label: "Completed",
    color: "bg-green-50 dark:bg-green-900/10",
    dot: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
  },
];

export default function KanbanBoard({ projectId }) {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id;

  const { tasks, loading, error, createTask, updateTask, deleteTask, fetchTasks } = useTasks(workspaceId, projectId);

  const [columns, setColumns] = useState({ todo: [], "in-progress": [], completed: [] });
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [filters, setFilters] = useState({ search: "", priority: "", assignee: "" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Distribute tasks into columns whenever tasks or filters change
  useEffect(() => {
    const applyFilters = (list) => {
      return list.filter((task) => {
        const matchSearch =
          !filters.search ||
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (task.description || "").toLowerCase().includes(filters.search.toLowerCase());
        const matchPriority = !filters.priority || task.priority === filters.priority;
        const matchAssignee =
          !filters.assignee ||
          (task.assignedTo || []).some((a) =>
            (a._id || a) === filters.assignee
          );
        return matchSearch && matchPriority && matchAssignee;
      });
    };

    const filtered = applyFilters(tasks);

    setColumns({
      todo: filtered.filter((t) => t.status === "todo"),
      "in-progress": filtered.filter((t) => t.status === "in-progress"),
      completed: filtered.filter((t) => t.status === "completed"),
    });
  }, [tasks, filters]);

  const findColumn = useCallback(
    (taskId) => {
      for (const colId of Object.keys(columns)) {
        if (columns[colId].find((t) => t._id === taskId)) return colId;
      }
      return null;
    },
    [columns]
  );

  const handleDragStart = ({ active }) => {
    const task = Object.values(columns)
      .flat()
      .find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const sourceCol = findColumn(active.id);
    const destCol = COLUMNS.find((c) => c.id === over.id)
      ? over.id
      : findColumn(over.id);

    if (!sourceCol || !destCol || sourceCol === destCol) return;

    setColumns((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const destItems = [...prev[destCol]];
      const taskIndex = sourceItems.findIndex((t) => t._id === active.id);
      const [moved] = sourceItems.splice(taskIndex, 1);
      destItems.push(moved);
      return { ...prev, [sourceCol]: sourceItems, [destCol]: destItems };
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const sourceCol = findColumn(active.id);
    const destCol = COLUMNS.find((c) => c.id === over.id)
      ? over.id
      : findColumn(over.id);

    if (!sourceCol || !destCol) return;

    // Re-order within same column
    if (sourceCol === destCol) {
      const items = [...columns[sourceCol]];
      const oldIndex = items.findIndex((t) => t._id === active.id);
      const newIndex = items.findIndex((t) => t._id === over.id);
      if (oldIndex !== newIndex) {
        setColumns((prev) => ({
          ...prev,
          [sourceCol]: arrayMove(items, oldIndex, newIndex),
        }));
      }
      return;
    }

    // Moved to a different column — persist to backend
    try {
      await updateTask(active.id, { status: destCol });
    } catch {
      // Revert on failure
      fetchTasks();
    }
  };

  const handleOpenCreate = (status = "todo") => {
    setSelectedTask({ status });
    setShowModal(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleSaveTask = async (formData) => {
    if (formData._id) {
      await updateTask(formData._id, formData);
    } else {
      await createTask({ ...formData, workspace: workspaceId, project: projectId });
    }
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleAITasksCreated = () => {
    fetchTasks();
  };

  const totalCount = Object.values(columns).flat().length;
  const completedCount = columns.completed.length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {projectId ? "Project Tasks" : "All Tasks"}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {completedCount} of {totalCount} tasks completed
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* AI Generate */}
          <button
            onClick={() => setShowAIGenerator(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Generate
          </button>

          {/* New Task */}
          <button
            onClick={() => handleOpenCreate("todo")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        workspaceId={workspaceId}
        filters={filters}
        onChange={setFilters}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error} —{" "}
          <button onClick={fetchTasks} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="flex gap-6 flex-1">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-1 min-w-[280px]">
              <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 flex-1 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={columns[col.id] || []}
                onAddTask={() => handleOpenCreate(col.id)}
                onEditTask={handleOpenEdit}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          {/* Drag overlay — ghost card while dragging */}
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-90 scale-105">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={selectedTask}
          workspaceId={workspaceId}
          projectId={projectId}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AITaskGenerator
          workspaceId={workspaceId}
          projectId={projectId}
          onTasksCreated={handleAITasksCreated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}
