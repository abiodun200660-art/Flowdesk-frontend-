'use client'

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

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
    "bg-violet-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function AssigneePicker({ workspaceId, value = [], onChange, multiple = true }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch workspace members
  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api
      .get(`/workspaces/${workspaceId}`)
      .then(({ data }) => {
        const memberList = (data.workspace?.members || []).map((m) => ({
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.role,
        }));
        setMembers(memberList);
      })
      .catch(() => setError("Could not load workspace members."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (id) => value.includes(id);

  const toggle = (id) => {
    if (!multiple) {
      onChange(isSelected(id) ? [] : [id]);
      setOpen(false);
      setSearch("");
      return;
    }
    onChange(
      isSelected(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  const removeAssignee = (id, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  };

  const selectedMembers = members.filter((m) => value.includes(m._id));

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={`min-h-[42px] w-full flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
          open
            ? "border-violet-500 ring-2 ring-violet-200 dark:ring-violet-800"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        } bg-white dark:bg-gray-800`}
      >
        {/* Selected chips */}
        {selectedMembers.length > 0 ? (
          selectedMembers.map((m) => (
            <span
              key={m._id}
              className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 text-xs font-medium px-2 py-1 rounded-lg"
            >
              {/* Mini avatar */}
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${hashColor(m.name)}`}>
                  {getInitials(m.name)}
                </span>
              )}
              {m.name.split(" ")[0]}
              <button
                onClick={(e) => removeAssignee(m._id, e)}
                className="ml-0.5 hover:text-violet-900 dark:hover:text-violet-100"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {multiple ? "Assign members..." : "Assign to..."}
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Member list */}
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center py-6 px-4">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 px-4">
                {search ? "No members match your search." : "No members in this workspace."}
              </p>
            ) : (
              filtered.map((member) => {
                const selected = isSelected(member._id);
                return (
                  <button
                    key={member._id}
                    onClick={() => toggle(member._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors ${
                      selected ? "bg-violet-50 dark:bg-violet-900/20" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${hashColor(member.name)}`}>
                          {getInitials(member.name)}
                        </div>
                      )}
                      {selected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selected ? "text-violet-700 dark:text-violet-300" : "text-gray-900 dark:text-white"}`}>
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
                    </div>

                    {/* Role badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      member.role === "admin"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : member.role === "member"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {member.role}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer — select count */}
          {multiple && value.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {value.length} member{value.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
