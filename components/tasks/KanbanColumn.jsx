"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

function SortableTaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} isDragging={isDragging} />
    </div>
  );
}

export default function KanbanColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[300px] max-w-[340px] flex-1">

      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${column.color}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
          <h3 className={`text-sm font-semibold ${column.textColor}`}>{column.label}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${column.textColor}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className={`p-1 rounded-lg hover:bg-white/40 dark:hover:bg-black/20 transition-colors ${column.textColor}`}
          title={`Add task to ${column.label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-xl p-3 space-y-3 min-h-[200px] transition-colors ${
          isOver
            ? "bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-300 dark:ring-violet-700"
            : column.color
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isOver ? "bg-violet-100 dark:bg-violet-900/40" : "bg-white/60 dark:bg-gray-700/40"
              }`}>
                <svg className={`w-5 h-5 ${isOver ? "text-violet-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className={`text-xs font-medium ${isOver ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}>
                {isOver ? "Drop here" : "No tasks yet"}
              </p>
              {!isOver && (
                <button
                  onClick={onAddTask}
                  className="mt-2 text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 font-medium hover:underline"
                >
                  + Add a task
                </button>
              )}
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}