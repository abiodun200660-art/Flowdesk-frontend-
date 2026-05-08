"use client";

import { useState } from "react";
import RecurringBadge from "./RecurringBadge";

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    dot: "bg-green-400",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  high: {
    label: "High",
    dot: "bg-orange-400",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  urgent: {
    label: "Urgent",
    dot: "bg-red-400",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(name = "") {
  const colors = [
    "bg-violet-500", "bg-blue-500", "bg-green-500",
    "bg-yellow-500", "bg-pink-500", "bg-indigo-500",
    "bg-teal-500", "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() ;
}

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task, onEdit, onDelete, isDragging = false }) {
  const [showMenu, setShowMenu] = useState(false);

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const overdue = isOverdue(task.dueDate) && task.status !== "completed";
  const dueDateLabel = formatDueDate(task.dueDate);
  const assignees = task.assignedTo || [];
  const labels = task.labels || [];
  const attachmentCount = (task.attachments || []).length;
  const commentCount = (task.comments || []).length;

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(task._id);
  };

  return (
    <div
      onClick={() => onEdit?.(task)}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all select-none ${
        isDragging
          ? "shadow-2xl ring-2 ring-violet-400 dark:ring-violet-500"
          : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
      } ${task.status === "completed" ? "opacity-75" : ""}`}
    >
      {/* Top row — priority + menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        {/* Priority badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              />
              <div className="absolute right-0 top-7 z-20 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className={`text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 ${
        task.status === "completed" ? "line-through text-gray-400 dark:text-gray-500" : ""
      }`}>
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {labels.slice(0, 3).map((label, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium"
            >
              {label}
            </span>
          ))}
          {labels.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
              +{labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Recurring badge */}
      {task.isRecurring && (
        <div className="mb-3">
          <RecurringBadge frequency={task.recurringFrequency} size="xs" />
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">

        {/* Assignee avatars */}
        <div className="flex items-center">
          {assignees.length === 0 ? (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">Unassigned</span>
          ) : (
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map((user, i) => (
                <div key={i} title={user.name || "Member"}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[9px] font-bold ${hashColor(user.name || "")}`}>
                      {getInitials(user.name || "")}
                    </div>
                  )}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side meta */}
        <div className="flex items-center gap-3">
          {/* Attachments */}
          {attachmentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {attachmentCount}
            </span>
          )}

          {/* Comments */}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {commentCount}
            </span>
          )}

          {/* Due date */}
          {dueDateLabel && (
            <span className={`flex items-center gap-1 text-xs font-medium ${
              overdue
                ? "text-red-500 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {overdue ? `Overdue · ${dueDateLabel}` : dueDateLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}