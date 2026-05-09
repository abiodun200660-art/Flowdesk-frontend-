'use client'

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const ACTIVITY_TYPES = {
  task_created:    { icon: "✅", color: "#4f46e5", bg: "rgba(79,70,229,0.12)",   label: "created task"        },
  task_completed:  { icon: "🎉", color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "completed task"      },
  task_assigned:   { icon: "👤", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "assigned task"       },
  task_commented:  { icon: "💬", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  label: "commented on"        },
  task_updated:    { icon: "✏️", color: "#0891b2", bg: "rgba(8,145,178,0.12)",   label: "updated task"        },
  task_deleted:    { icon: "🗑",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "deleted task"        },
  member_joined:   { icon: "🙌", color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "joined workspace"    },
  member_invited:  { icon: "📨", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "invited"             },
  project_created: { icon: "📁", color: "#4f46e5", bg: "rgba(79,70,229,0.12)",   label: "created project"     },
  project_updated: { icon: "📝", color: "#0891b2", bg: "rgba(8,145,178,0.12)",   label: "updated project"     },
  file_uploaded:   { icon: "📎", color: "#db2777", bg: "rgba(219,39,119,0.12)",  label: "uploaded file"       },
  label_added:     { icon: "🏷️", color: "#14b8a6", bg: "rgba(20,184,166,0.12)",  label: "added label"         },
  due_date_set:    { icon: "📅", color: "#f97316", bg: "rgba(249,115,22,0.12)",  label: "set due date"        },
  priority_changed:{ icon: "🚦", color: "#eab308", bg: "rgba(234,179,8,0.12)",   label: "changed priority"    },
  status_changed:  { icon: "🔄", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  label: "moved to"            },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ACTIVITIES = [
  { id: 1,  type: "task_completed",   user: { name: "Bob Smith",    initials: "BS", color: "#0891b2" }, target: "Set up CI/CD pipeline",         meta: null,              time: new Date(Date.now() - 2   * 60000).toISOString() },
  { id: 2,  type: "task_commented",   user: { name: "Carol White",  initials: "CW", color: "#059669" }, target: "Redesign onboarding flow",      meta: '"Looks great!"',  time: new Date(Date.now() - 18  * 60000).toISOString() },
  { id: 3,  type: "label_added",      user: { name: "David Lee",    initials: "DL", color: "#d97706" }, target: "Fix auth token expiry bug",     meta: "urgent",          time: new Date(Date.now() - 65  * 60000).toISOString() },
  { id: 4,  type: "member_invited",   user: { name: "Alice Johnson", initials: "AJ", color: "#4f46e5" }, target: "Emma Davis",                  meta: "Designer",        time: new Date(Date.now() - 3   * 3600000).toISOString() },
  { id: 5,  type: "task_created",     user: { name: "Bob Smith",    initials: "BS", color: "#0891b2" }, target: "Write API documentation",      meta: null,              time: new Date(Date.now() - 5   * 3600000).toISOString() },
  { id: 6,  type: "status_changed",   user: { name: "Carol White",  initials: "CW", color: "#059669" }, target: "Mobile responsive fixes",      meta: "In Review",       time: new Date(Date.now() - 6   * 3600000).toISOString() },
  { id: 7,  type: "priority_changed", user: { name: "Alice Johnson", initials: "AJ", color: "#4f46e5" }, target: "Database schema migration",   meta: "High",            time: new Date(Date.now() - 8   * 3600000).toISOString() },
  { id: 8,  type: "file_uploaded",    user: { name: "David Lee",    initials: "DL", color: "#d97706" }, target: "design-mockups-v3.fig",        meta: "3.2 MB",          time: new Date(Date.now() - 10  * 3600000).toISOString() },
  { id: 9,  type: "project_created",  user: { name: "Alice Johnson", initials: "AJ", color: "#4f46e5" }, target: "Mobile App",                  meta: null,              time: new Date(Date.now() - 1   * 86400000).toISOString() },
  { id: 10, type: "task_assigned",    user: { name: "Bob Smith",    initials: "BS", color: "#0891b2" }, target: "User testing session prep",    meta: "Emma Davis",      time: new Date(Date.now() - 1.2 * 86400000).toISOString() },
  { id: 11, type: "due_date_set",     user: { name: "Carol White",  initials: "CW", color: "#059669" }, target: "Write API documentation",     meta: "May 10",          time: new Date(Date.now() - 1.5 * 86400000).toISOString() },
  { id: 12, type: "member_joined",    user: { name: "Emma Davis",   initials: "ED", color: "#7c3aed" }, target: "FlowDesk HQ",                  meta: null,              time: new Date(Date.now() - 2   * 86400000).toISOString() },
  { id: 13, type: "task_updated",     user: { name: "David Lee",    initials: "DL", color: "#d97706" }, target: "Database schema migration",    meta: null,              time: new Date(Date.now() - 2.5 * 86400000).toISOString() },
  { id: 14, type: "project_updated",  user: { name: "Alice Johnson", initials: "AJ", color: "#4f46e5" }, target: "FlowDesk App",                meta: null,              time: new Date(Date.now() - 3   * 86400000).toISOString() },
  { id: 15, type: "task_created",     user: { name: "Emma Davis",   initials: "ED", color: "#7c3aed" }, target: "UI component library setup",  meta: null,              time: new Date(Date.now() - 3.5 * 86400000).toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoStr) {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(activities) {
  const groups = {};
  activities.forEach((a) => {
    const d = new Date(a.time);
    const now = new Date();
    let label;
    if (d.toDateString() === now.toDateString()) {
      label = "Today";
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      }
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(a);
  });
  return groups;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: user.color || "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.08)",
      }}
    >
      {user.initials}
    </div>
  );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const cfg = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.task_updated;
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: cfg.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
        border: `1px solid ${cfg.color}22`,
      }}
    >
      {cfg.icon}
    </div>
  );
}

// ─── Single Activity Row ──────────────────────────────────────────────────────
function ActivityRow({ activity, showAvatar = true }) {
  const [hovered, setHovered] = useState(false);
  const cfg = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.task_updated;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 9,
        background: hovered ? "rgba(255,255,255,0.03)" : "none",
        transition: "background 0.15s",
        cursor: "default",
      }}
    >
      {/* Avatar */}
      {showAvatar && <Avatar user={activity.user} size={30} />}

      {/* Activity icon (compact mode) */}
      {!showAvatar && <ActivityIcon type={activity.type} />}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: "#c9d1d9",
            lineHeight: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <strong style={{ color: "#e6edf3", fontWeight: 600 }}>
            {activity.user.name}
          </strong>{" "}
          <span style={{ color: "#8b949e" }}>{cfg.label}</span>{" "}
          <span
            style={{
              color: cfg.color,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activity.target}
          </span>
          {activity.meta && (
            <span style={{ color: "#6e7681", fontSize: 12 }}>
              {" "}
              →{" "}
              <span
                style={{
                  background: `${cfg.color}18`,
                  color: cfg.color,
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {activity.meta}
              </span>
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: 11, color: "#6e7681", marginTop: 2 }}>
          {timeAgo(activity.time)}
        </div>
      </div>

      {/* Type icon on hover */}
      {hovered && showAvatar && (
        <ActivityIcon type={activity.type} />
      )}
    </div>
  );
}

// ─── Date Group Label ─────────────────────────────────────────────────────────
function DateLabel({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        marginTop: 4,
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#6e7681",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { key: "all",      label: "All" },
  { key: "tasks",    label: "Tasks" },
  { key: "comments", label: "Comments" },
  { key: "members",  label: "Members" },
  { key: "projects", label: "Projects" },
  { key: "files",    label: "Files" },
];

const FILTER_MAP = {
  tasks:    ["task_created","task_completed","task_assigned","task_updated","task_deleted","status_changed","priority_changed","due_date_set","label_added"],
  comments: ["task_commented"],
  members:  ["member_joined","member_invited"],
  projects: ["project_created","project_updated"],
  files:    ["file_uploaded"],
};

function FilterBar({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        overflowX: "auto",
        scrollbarWidth: "none",
        paddingBottom: 2,
      }}
    >
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            padding: "4px 10px",
            borderRadius: 20,
            border: "none",
            background: active === opt.key
              ? "#4f46e5"
              : "rgba(255,255,255,0.05)",
            color: active === opt.key ? "#fff" : "#8b949e",
            fontSize: 12,
            fontWeight: active === opt.key ? 700 : 400,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
        color: "#6e7681",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#8b949e", marginBottom: 4 }}>
        No activity found
      </div>
      <div style={{ fontSize: 12 }}>
        {filter === "all"
          ? "Activity will appear here as your team works."
          : `No ${filter} activity yet.`}
      </div>
    </div>
  );
}

// ─── Live indicator ───────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        color: "#22c55e",
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#22c55e",
          animation: "afPulse 1.6s ease-in-out infinite",
          display: "inline-block",
        }}
      />
      Live
    </span>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1e1e2e", animation: "afShimmer 1.4s infinite", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 4, background: "#1e1e2e", animation: "afShimmer 1.4s infinite", marginBottom: 6, width: "70%" }} />
        <div style={{ height: 10, borderRadius: 4, background: "#1e1e2e", animation: "afShimmer 1.4s infinite", width: "30%" }} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ActivityFeed({
  activities: externalActivities,
  maxHeight   = 480,
  showHeader  = true,
  showFilters = true,
  showGroups  = true,
  compact     = false,
  loading     = false,
  onViewAll,
}) {
  const [activities,  setActivities]  = useState(externalActivities || MOCK_ACTIVITIES);
  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(1);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [newCount,    setNewCount]    = useState(0);
  const liveRef = useRef();

  // ── Simulate live updates every 30s ──
  useEffect(() => {
    if (!liveEnabled) return;
    liveRef.current = setInterval(() => {
      setNewCount((n) => n + 1);
    }, 30_000);
    return () => clearInterval(liveRef.current);
  }, [liveEnabled]);

  // ── Apply new live items ──
  function applyLiveUpdates() {
    const fakeNew = {
      id:     Date.now(),
      type:   "task_updated",
      user:   { name: "Alice Johnson", initials: "AJ", color: "#4f46e5" },
      target: "Latest task update",
      meta:   null,
      time:   new Date().toISOString(),
    };
    setActivities((prev) => [fakeNew, ...prev]);
    setNewCount(0);
  }

  // ── Filtering ──
  const filtered = activities.filter((a) => {
    if (filter === "all") return true;
    return (FILTER_MAP[filter] || []).includes(a.type);
  });

  // ── Pagination ──
  const paginated  = filtered.slice(0, page * PAGE_SIZE);
  const hasMore    = paginated.length < filtered.length;

  // ── Grouping ──
  const grouped = showGroups ? groupByDate(paginated) : { "": paginated };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        background: "#13131f",
        border: "1px solid #1e1e2e",
        borderRadius: 12,
        overflow: "hidden",
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
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3" }}>
              Activity
            </span>
            <LiveDot />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Live toggle */}
            <button
              onClick={() => setLiveEnabled((v) => !v)}
              title={liveEnabled ? "Pause live updates" : "Resume live updates"}
              style={{
                background: "none",
                border: "1px solid #2d2d3f",
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: 11,
                color: liveEnabled ? "#22c55e" : "#6e7681",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {liveEnabled ? "⏸ Pause" : "▶ Resume"}
            </button>

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

      {/* ── Filters ── */}
      {showFilters && (
        <div style={{ padding: "8px 16px 10px", borderBottom: "1px solid #1e1e2e" }}>
          <FilterBar active={filter} onChange={(f) => { setFilter(f); setPage(1); }} />
        </div>
      )}

      {/* ── New updates banner ── */}
      {newCount > 0 && (
        <button
          onClick={applyLiveUpdates}
          style={{
            width: "100%",
            padding: "8px 16px",
            background: "rgba(79,70,229,0.1)",
            border: "none",
            borderBottom: "1px solid #4f46e522",
            color: "#818cf8",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(79,70,229,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(79,70,229,0.1)")}
        >
          ↑ {newCount} new update{newCount !== 1 ? "s" : ""} — click to refresh
        </button>
      )}

      {/* ── Feed ── */}
      <div
        style={{
          overflowY: "auto",
          maxHeight,
          scrollbarWidth: "thin",
          scrollbarColor: "#2d2d3f transparent",
        }}
      >
        {loading ? (
          <div style={{ padding: "4px 0" }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div style={{ padding: "4px 0" }}>
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {showGroups && dateLabel && <DateLabel label={dateLabel} />}
                {items.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    showAvatar={!compact}
                  />
                ))}
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div style={{ padding: "10px 16px" }}>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    width: "100%",
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
                  Load more ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes afPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes afShimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
      `}</style>
    </div>
  );
}