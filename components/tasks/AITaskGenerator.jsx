"use client";

import { useState } from "react";
import api from "@/lib/api";

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function AITaskGenerator({ workspaceId, projectId, onTasksCreated, onClose }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState([]);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");
    setTasks([]);
    setSelected([]);

    try {
      const { data } = await api.post("/api/ai/generate-tasks", {
        goal: goal.trim(),
        workspace: workspaceId,
        projectId,
      });
      const generated = data.tasks || [];
      setTasks(generated);
      setSelected(generated.map((_, i) => i));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === tasks.length ? [] : tasks.map((_, i) => i));
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    setCreating(true);
    setError("");

    try {
      const tasksToCreate = tasks
        .filter((_, i) => selected.includes(i))
        .map((t) => ({
          title: t.title,
          description: t.description || "",
          priority: t.priority || "medium",
          workspace: workspaceId,
          project: projectId || undefined,
        }));

      // /api/tasks/bulk doesn't exist — create tasks one by one via POST /api/tasks
      const created = await Promise.all(
        tasksToCreate.map((payload) => api.post("/api/tasks", payload).then((r) => r.data.task))
      );
      onTasksCreated?.(created);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tasks. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Task Generator</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Describe a goal and AI will break it into tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What is your goal?
            </label>
            <div className="flex gap-3">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Build a user authentication system with login, register, and password reset"
                rows={3}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Press Enter or click Generate to create tasks</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading shimmer */}
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">AI is generating tasks...</span>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          )}

          {/* Generated Tasks */}
          {!loading && tasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Generated Tasks ({tasks.length})
                </h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  {selected.length === tasks.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selected.includes(index)
                        ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected.includes(index)
                        ? "bg-violet-600 border-violet-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {selected.includes(index) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</span>
                        {task.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      {task.estimatedHours && (
                        <p className="text-xs text-gray-400 mt-1">⏱ ~{task.estimatedHours}h estimated</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {tasks.length > 0 && !loading && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
              >
                Regenerate
              </button>
            )}

            {tasks.length === 0 ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !goal.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Tasks
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating || selected.length === 0}
                className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create {selected.length} Task{selected.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
