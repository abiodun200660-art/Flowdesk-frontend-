// flowdesk-frontend/components/dashboard/UpcomingDeadlines.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "#ef444433", dot: true  },
  High:     { color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "#f9731633", dot: false },
  Medium:   { color: "#eab308", bg: "rgba(234,179,8,0.1)",   border: "#eab30833", dot: false },
  Low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "#22c55e33", dot: false },
};

const STATUS_CONFIG = {
  "Todo":        { color: "#3b82f6", label: "Todo"        },
  "In Progress": { color: "#f59e0b", label: "In Progress" },
  "In Review":   { color: "#8b5cf6", label: "In Review"   },
  "Backlog":     { color: "#6e7681", label: "Backlog"      },
  "Done":        { color: "#22c55e", label: "Done"         },
};

const AVATAR_COLORS = [
  "#4f46e5","#0891b2","#059669","#d97706",
  "#dc2626","#7c3aed","#db2777","#0284c7",
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DEADLINES = [
  {
    id: 1,
    title: "Fix auth token expiry bug",
    priority: "Critical",
    status: "Todo",
    dueDate: new Date(Date.now() + 0.5 * 86400000).toISOString(),
    assignees: [
      { name: "Bob Smith",    initials: "BS" },
      { name: "Alice Johnson", initials: "AJ" },
    ],
    project: "API v2",
    progress: 20,
  },
  {
    id: 2,
    title: "Redesign onboarding flow",
    priority: "High",
    status: "In Progress",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    assignees: [{ name: "Alice Johnson", initials: "AJ" }],
    project: "FlowDesk App",
    progress: 65,
  },
  {
    id: 3,
    title: "Mobile responsive fixes",
    priority: "Medium",
    status: "In Review",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    assignees: [
      { name: "Carol White", initials: "CW" },
      { name: "Emma Davis",  initials: "ED" },
    ],
    project: "FlowDesk App",
    progress: 90,
  },
  {
    id: 4,
    title: "Write API documentation",
    priority: "Medium",
    status: "In Progress",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    assignees: [{ name: "Carol White", initials: "CW" }],
    project: "API v2",
    progress: 45,
  },
  {
    id: 5,
    title: "User testing session prep",
    priority: "Low",
    status: "Todo",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    assignees: [{ name: "Alice Johnson", initials: "AJ" }],
    project: "FlowDesk App",
    progress: 10,
  },
  {
    id: 6,
    title: "Database schema migration",
    priority: "High",
    status: "Backlog",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    assignees: [{ name: "David Lee", initials: "DL" }],
    project: "API v2",
    progress: 0,
  },
  {
    id: 7,
    title: "UI component library setup",
    priority: "Low",
    status: "In Progress",
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    assignees: [{ name: "Emma Davis", initials: "ED" }],
    project: "Mobile App",
    progress: 55,
  },
  {
    id: 8,
    title: "Set up error monitoring",
    priority: "High",
    status: "Todo",
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), // overdue
    assignees: [{ name: "Bob Smith", initials: "BS" }],
    project: "API v2",
    progress: 5,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avatarColor(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getDueInfo(isoDate) {
  const now      = new Date();
  const due      = new Date(isoDate);
  const diffMs   = due - now;
  const diffDays = Math.ceil(diffMs / 86400000);
  const diffHrs  = Math.ceil(diffMs / 3600000);

  if (diffMs < 0) {
    const overDays = Math.abs(Math.floor(diffMs / 86400000));
    return {
      label:    overDays === 0 ? "Due today" : `${overDays}d overdue`,
      color:    "#ef4444",
      bg:       "rgba(239,68,68,0.1)",
      border:   "#ef444433",
      isOverdue: true,
      urgent:    true,
      diffDays,
    };
  }
  if (diffHrs <= 24) return {
    label: diffHrs <= 1 ? "Due in < 1h" : `Due in ${diffHrs}h`,
    color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "#ef444433",
    isOverdue: false, urgent: true, diffDays,
  };
  if (diffDays <= 2) return {
    label: `Due in ${diffDays}d`,
    color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "#f9731633",
    isOverdue: false, urgent: true, diffDays,
  };
  if (diffDays <= 7) return {
    label: `Due in ${diffDays}d`,
    color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "#eab30833",
    isOverdue: false, urgent: false, diffDays,
  };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "#6e7681", bg: "rgba(110,118,129,0.08)", border: "#6e768122",
    isOverdue: false, urgent: false, diffDays,
  };
}

function sortDeadlines(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
    if (sortBy === "dueDate")  return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === "priority") {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    }
    if (sortBy === "progress") return a.progress - b.progress;
    return 0;
  });
}

// ─── Avatar Stack ─────────────────────────────────────────────────────────────
function AvatarStack({ assignees, max = 3 }) {
  const visible  = assignees.slice(0, max);
  const overflow = assignees.length - max;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((a, i) => (
        <div
          key={i}
          title={a.name}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: avatarColor(a.name),
            border: "2px solid #13131f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            fontWeight: 700,
            color: "#fff",
            marginLeft: i > 0 ? -6 : 0,
            zIndex: visible.length - i,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {a.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#2d2d3f",
            border: "2px solid #13131f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            fontWeight: 700,
            color: "#8b949e",
            marginLeft: -6,
            zIndex: 0,
            flexShrink: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: cfg.color,
            animation: "udPulse 1.6s ease-in-out infinite",
          }}
        />
      )}
      {priority}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function MiniProgress({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 60 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "#1e1e2e",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: value === 100
              ? "#22c55e"
              : `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 2,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#6e7681",
          fontWeight: 600,
          flexShrink: 0,
          minWidth: 26,
          textAlign: "right",
        }}
      >
        {value}%
      </span>
    </div>
  );
}

// ─── Single Deadline Row ──────────────────────────────────────────────────────
function DeadlineRow({ task, compact, onMarkDone }) {
  const [hovered,  setHovered]  = useState(false);
  const [checking, setChecking] = useState(false);
  const dueInfo   = getDueInfo(task.dueDate);
  const priCfg    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
  const statusCfg = STATUS_CONFIG[task.status]     || STATUS_CONFIG["Todo"];

  async function handleCheck() {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 400));
    onMarkDone?.(task.id);
    setChecking(false);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: compact ? "10px 12px" : "12px 16px",
        borderRadius: 10,
        background: hovered ? "rgba(255,255,255,0.03)" : "none",
        borderLeft: `3px solid ${dueInfo.urgent ? dueInfo.color : priCfg.color}`,
        transition: "background 0.15s",
        cursor: "default",
        marginBottom: 2,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          title="Mark as done"
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: `1.5px solid ${checking ? "#22c55e" : "#2d2d3f"}`,
            background: checking ? "rgba(34,197,94,0.15)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#22c55e")}
          onMouseLeave={(e) => { if (!checking) e.currentTarget.style.borderColor = "#2d2d3f"; }}
        >
          {checking && (
            <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 700 }}>✓</span>
          )}
        </button>

        {/* Title + project */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#e6edf3",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 2,
            }}
          >
            {task.title}
          </div>
          <div style={{ fontSize: 11, color: "#6e7681" }}>
            📁 {task.project}
          </div>
        </div>

        {/* Due badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 20,
            background: dueInfo.bg,
            color: dueInfo.color,
            border: `1px solid ${dueInfo.border}`,
            flexShrink: 0,
            whiteSpace: "nowrap",
            animation: dueInfo.urgent ? "udPulse 1.8s ease-in-out infinite" : "none",
          }}
        >
          {dueInfo.isOverdue ? "⚠ " : ""}{dueInfo.label}
        </span>
      </div>

      {/* Bottom row */}
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 28 }}>
          <PriorityBadge priority={task.priority} />

          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: statusCfg.color,
              background: `${statusCfg.color}15`,
              padding: "2px 7px",
              borderRadius: 20,
              border: `1px solid ${statusCfg.color}22`,
              flexShrink: 0,
            }}
          >
            {statusCfg.label}
          </span>

          <MiniProgress value={task.progress} color={priCfg.color} />

          <AvatarStack assignees={task.assignees} />
        </div>
      )}
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
function FilterTabs({ active, onChange, counts }) {
  const tabs = [
    { key: "all",      label: "All"      },
    { key: "overdue",  label: "Overdue"  },
    { key: "today",    label: "Today"    },
    { key: "thisWeek", label: "This Week" },
  ];
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: "4px 10px",
            borderRadius: 20,
            border: "none",
            background: active === tab.key ? "#4f46e5" : "rgba(255,255,255,0.05)",
            color: active === tab.key ? "#fff" : "#8b949e",
            fontSize: 11,
            fontWeight: active === tab.key ? 700 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: active === tab.key
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.1)",
                padding: "0px 5px",
                borderRadius: 10,
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
  const messages = {
    all:      { icon: "🎉", title: "All caught up!", sub: "No upcoming deadlines." },
    overdue:  { icon: "✅", title: "Nothing overdue!", sub: "Great work keeping on track." },
    today:    { icon: "☀️", title: "Free today!",       sub: "No deadlines due today."     },
    thisWeek: { icon: "📅", title: "Clear week ahead!", sub: "Nothing due this week."      },
  };
  const msg = messages[filter] || messages.all;
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
        color: "#6e7681",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{msg.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#8b949e", marginBottom: 4 }}>
        {msg.title}
      </div>
      <div style={{ fontSize: 12 }}>{msg.sub}</div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DeadlineSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            borderLeft: "3px solid #2d2d3f",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "#1e1e2e", animation: "udShimmer 1.4s infinite", flexShrink: 0 }} />
            <div style={{ flex: 1, height: 12, borderRadius: 4, background: "#1e1e2e", animation: "udShimmer 1.4s infinite" }} />
            <div style={{ width: 64, height: 20, borderRadius: 10, background: "#1e1e2e", animation: "udShimmer 1.4s infinite" }} />
          </div>
          <div style={{ display: "flex", gap: 8, paddingLeft: 28 }}>
            <div style={{ width: 56, height: 18, borderRadius: 10, background: "#1e1e2e", animation: "udShimmer 1.4s infinite" }} />
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#1e1e2e", animation: "udShimmer 1.4s infinite", alignSelf: "center" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UpcomingDeadlines({
  tasks: externalTasks,
  maxVisible   = 5,
  compact      = false,
  loading      = false,
  showHeader   = true,
  showFilters  = true,
  showSortBy   = true,
  onViewAll,
  onTaskClick,
}) {
  const [tasks,   setTasks]   = useState(externalTasks || MOCK_DEADLINES);
  const [filter,  setFilter]  = useState("all");
  const [sortBy,  setSortBy]  = useState("dueDate");
  const [showAll, setShowAll] = useState(false);

  // ── Filter logic ──
  const filtered = useMemo(() => {
    const now  = new Date();
    const eod  = new Date(now); eod.setHours(23, 59, 59, 999);
    const eow  = new Date(now); eow.setDate(now.getDate() + 7);

    return tasks.filter((t) => {
      if (t.status === "Done") return false;
      const due = new Date(t.dueDate);
      if (filter === "overdue")  return due < now;
      if (filter === "today")    return due >= now && due <= eod;
      if (filter === "thisWeek") return due >= now && due <= eow;
      return true;
    });
  }, [tasks, filter]);

  // ── Sort ──
  const sorted = useMemo(() => sortDeadlines(filtered, sortBy), [filtered, sortBy]);

  // ── Paginate ──
  const visible = showAll ? sorted : sorted.slice(0, maxVisible);
  const hasMore = sorted.length > maxVisible;

  // ── Tab counts ──
  const counts = useMemo(() => {
    const now = new Date();
    const eod = new Date(now); eod.setHours(23, 59, 59, 999);
    const eow = new Date(now); eow.setDate(now.getDate() + 7);
    const active = tasks.filter((t) => t.status !== "Done");
    return {
      all:      active.length,
      overdue:  active.filter((t) => new Date(t.dueDate) < now).length,
      today:    active.filter((t) => { const d = new Date(t.dueDate); return d >= now && d <= eod; }).length,
      thisWeek: active.filter((t) => { const d = new Date(t.dueDate); return d >= now && d <= eow; }).length,
    };
  }, [tasks]);

  // ── Mark done ──
  function handleMarkDone(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Done", progress: 100 } : t))
    );
  }

  // ── Urgent count (for header badge) ──
  const urgentCount = tasks.filter((t) => {
    if (t.status === "Done") return false;
    const info = getDueInfo(t.dueDate);
    return info.urgent;
  }).length;

  return (
    <div
      style={{
        background: "#13131f",
        border: "1px solid #1e1e2e",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      {showHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 10px",
            borderBottom: showFilters ? "none" : "1px solid #1e1e2e",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3" }}>
              Upcoming Deadlines
            </span>
            {urgentCount > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 20,
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  border: "1px solid #ef444433",
                  animation: "udPulse 1.8s ease-in-out infinite",
                }}
              >
                {urgentCount} urgent
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Sort */}
            {showSortBy && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "4px 8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #2d2d3f",
                  borderRadius: 6,
                  color: "#8b949e",
                  fontSize: 11,
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="dueDate"  style={{ background: "#1a1a2e" }}>By due date</option>
                <option value="priority" style={{ background: "#1a1a2e" }}>By priority</option>
                <option value="progress" style={{ background: "#1a1a2e" }}>By progress</option>
              </select>
            )}

            {onViewAll && (
              <button
                onClick={onViewAll}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#818cf8",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  padding: 0,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                View all →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      {showFilters && (
        <div
          style={{
            padding: "8px 16px 10px",
            borderBottom: "1px solid #1e1e2e",
          }}
        >
          <FilterTabs
            active={filter}
            onChange={(f) => { setFilter(f); setShowAll(false); }}
            counts={counts}
          />
        </div>
      )}

      {/* ── List ── */}
      <div
        style={{
          padding: compact ? "6px 4px" : "8px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {loading ? (
          <DeadlineSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            {visible.map((task) => (
              <DeadlineRow
                key={task.id}
                task={task}
                compact={compact}
                onMarkDone={handleMarkDone}
              />
            ))}

            {/* Load more / collapse */}
            {hasMore && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "1px solid #2d2d3f",
                  background: "none",
                  color: "#8b949e",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#8b949e"; }}
              >
                {showAll
                  ? "▲ Show less"
                  : `▼ Show ${sorted.length - maxVisible} more`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Footer summary ── */}
      {!loading && sorted.length > 0 && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #1e1e2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#6e7681" }}>
            {counts.overdue > 0 && (
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                ⚠ {counts.overdue} overdue
              </span>
            )}
            {counts.today > 0 && (
              <span style={{ color: "#f97316", fontWeight: 600 }}>
                📅 {counts.today} due today
              </span>
            )}
            {counts.thisWeek > 0 && (
              <span>📆 {counts.thisWeek} this week</span>
            )}
          </div>
          <Link
            href="/dashboard/tasks"
            style={{
              fontSize: 11,
              color: "#818cf8",
              textDecoration: "none",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Manage tasks →
          </Link>
        </div>
      )}

      <style>{`
        @keyframes udPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes udShimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
      `}</style>
    </div>
  );
}