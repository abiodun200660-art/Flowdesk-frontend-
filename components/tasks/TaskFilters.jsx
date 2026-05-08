// flowdesk-frontend/components/tasks/TaskFilters.jsx

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES = ["All", "Backlog", "Todo", "In Progress", "In Review", "Done"];
const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "dueDate_asc", label: "Due Date ↑" },
  { value: "dueDate_desc", label: "Due Date ↓" },
  { value: "priority_desc", label: "Priority ↓" },
  { value: "title_asc", label: "Title A–Z" },
];

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const STATUS_COLORS = {
  Backlog: "#6e7681",
  Todo: "#3b82f6",
  "In Progress": "#f59e0b",
  "In Review": "#8b5cf6",
  Done: "#22c55e",
};

const MOCK_ASSIGNEES = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Carol White" },
  { id: 4, name: "David Lee" },
];

const MOCK_LABELS = ["bug", "feature", "design", "backend", "urgent", "docs", "refactor"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
const AVATAR_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed"];
function avatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
        background: color ? `${color}22` : "rgba(255,255,255,0.08)",
        color: color || "#c9d1d9", border: `1px solid ${color || "#2d2d3f"}`,
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 0, color: "inherit", fontSize: 12, lineHeight: 1,
            opacity: 0.7,
          }}
        >×</button>
      )}
    </span>
  );
}

// ─── Dropdown Wrapper ─────────────────────────────────────────────────────────
function FilterDropdown({ label, icon, children, activeCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8, border: "none",
          background: open || activeCount > 0 ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.05)",
          color: open || activeCount > 0 ? "#818cf8" : "#8b949e",
          cursor: "pointer", fontSize: 13, fontWeight: 500,
          border: open || activeCount > 0 ? "1px solid #4f46e5" : "1px solid #2d2d3f",
          transition: "all 0.15s",
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        {activeCount > 0 && (
          <span
            style={{
              background: "#4f46e5", color: "#fff", borderRadius: "50%",
              width: 16, height: 16, fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {activeCount}
          </span>
        )}
        <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#1a1a2e", border: "1px solid #2d2d3f", borderRadius: 10,
            zIndex: 300, minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            padding: 8,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
      <span
        style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: "#6e7681", pointerEvents: "none",
        }}
      >🔍</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks…"
        style={{
          width: "100%", boxSizing: "border-box", padding: "7px 10px 7px 32px",
          background: "rgba(255,255,255,0.04)", border: "1px solid #2d2d3f",
          borderRadius: 8, color: "#e6edf3", fontSize: 13, outline: "none",
          fontFamily: "inherit", transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
        onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
      />
      {value && (
        <button
          onClick={() => { onChange(""); ref.current.focus(); }}
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#6e7681", fontSize: 14, padding: 2,
          }}
        >×</button>
      )}
    </div>
  );
}

// ─── Checkbox Item ────────────────────────────────────────────────────────────
function CheckItem({ label, checked, onChange, color, prefix }) {
  return (
    <label
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
        borderRadius: 6, cursor: "pointer", transition: "background 0.15s",
        fontSize: 13, color: "#c9d1d9",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <input
        type="checkbox" checked={checked} onChange={onChange}
        style={{ accentColor: "#4f46e5", width: 14, height: 14 }}
      />
      {color && (
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      )}
      {prefix && <span>{prefix}</span>}
      <span style={{ flex: 1 }}>{label}</span>
    </label>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangeFilter({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 0" }}>
      {["from", "to"].map((key) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <label style={{ fontSize: 11, color: "#6e7681", textTransform: "uppercase" }}>{key}</label>
          <input
            type="date"
            value={value?.[key] || ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            style={{
              background: "#161622", border: "1px solid #2d2d3f", borderRadius: 6,
              color: "#e6edf3", fontSize: 12, padding: "4px 8px", outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      ))}
      {(value?.from || value?.to) && (
        <button
          onClick={() => onChange({})}
          style={{
            background: "none", border: "none", color: "#ef4444",
            fontSize: 12, cursor: "pointer", textAlign: "left", padding: 0,
          }}
        >
          Clear dates
        </button>
      )}
    </div>
  );
}

// ─── Active Filter Summary ────────────────────────────────────────────────────
function ActiveFilters({ filters, onRemove, onClearAll }) {
  const chips = [];

  filters.priorities.filter((p) => p !== "All").forEach((p) =>
    chips.push({ key: `priority_${p}`, label: p, color: PRIORITY_COLORS[p], remove: () => onRemove("priorities", p) })
  );
  filters.statuses.filter((s) => s !== "All").forEach((s) =>
    chips.push({ key: `status_${s}`, label: s, color: STATUS_COLORS[s], remove: () => onRemove("statuses", s) })
  );
  filters.assignees.forEach((a) =>
    chips.push({ key: `assignee_${a}`, label: a, remove: () => onRemove("assignees", a) })
  );
  filters.labels.forEach((l) =>
    chips.push({ key: `label_${l}`, label: `#${l}`, remove: () => onRemove("labels", l) })
  );
  if (filters.dateRange?.from || filters.dateRange?.to) {
    const label = [filters.dateRange.from, filters.dateRange.to].filter(Boolean).join(" → ");
    chips.push({ key: "dateRange", label, remove: () => onRemove("dateRange", null) });
  }

  if (!chips.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 10 }}>
      <span style={{ fontSize: 11, color: "#6e7681", marginRight: 4 }}>Active:</span>
      {chips.map((c) => <Chip key={c.key} label={c.label} color={c.color} onRemove={c.remove} />)}
      <button
        onClick={onClearAll}
        style={{
          background: "none", border: "none", color: "#ef4444",
          fontSize: 12, cursor: "pointer", fontWeight: 600,
        }}
      >
        Clear all
      </button>
    </div>
  );
}

// ─── DEFAULT FILTERS STATE ────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  search: "",
  priorities: [],
  statuses: [],
  assignees: [],
  labels: [],
  dateRange: {},
  sort: "createdAt_desc",
  showCompleted: true,
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskFilters({ filters: externalFilters, onChange, assignees = MOCK_ASSIGNEES, labels = MOCK_LABELS }) {
  const [filters, setFilters] = useState(externalFilters || DEFAULT_FILTERS);

  const update = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      onChange?.(next);
    },
    [filters, onChange]
  );

  function toggleArrayItem(key, item) {
    const arr = filters[key] || [];
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    update(key, next);
  }

  function removeFilter(key, value) {
    if (key === "dateRange") { update("dateRange", {}); return; }
    toggleArrayItem(key, value);
  }

  function clearAll() {
    const reset = { ...DEFAULT_FILTERS };
    setFilters(reset);
    onChange?.(reset);
  }

  const activeCount = (k) => (filters[k] || []).filter((v) => v !== "All").length;

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        background: "#0d0d1a",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #1e1e2e",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <SearchInput value={filters.search} onChange={(v) => update("search", v)} />

        {/* Priority */}
        <FilterDropdown label="Priority" icon="🚦" activeCount={activeCount("priorities")}>
          {PRIORITIES.filter((p) => p !== "All").map((p) => (
            <CheckItem
              key={p} label={p} checked={filters.priorities.includes(p)}
              onChange={() => toggleArrayItem("priorities", p)}
              color={PRIORITY_COLORS[p]}
            />
          ))}
        </FilterDropdown>

        {/* Status */}
        <FilterDropdown label="Status" icon="📋" activeCount={activeCount("statuses")}>
          {STATUSES.filter((s) => s !== "All").map((s) => (
            <CheckItem
              key={s} label={s} checked={filters.statuses.includes(s)}
              onChange={() => toggleArrayItem("statuses", s)}
              color={STATUS_COLORS[s]}
            />
          ))}
        </FilterDropdown>

        {/* Assignee */}
        <FilterDropdown label="Assignee" icon="👤" activeCount={activeCount("assignees")}>
          {assignees.map((a) => (
            <CheckItem
              key={a.id} label={a.name} checked={filters.assignees.includes(a.name)}
              onChange={() => toggleArrayItem("assignees", a.name)}
              prefix={
                <span
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: avatarColor(a.name), color: "#fff",
                    fontSize: 9, fontWeight: 700, display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  {getInitials(a.name)}
                </span>
              }
            />
          ))}
        </FilterDropdown>

        {/* Labels */}
        <FilterDropdown label="Labels" icon="🏷️" activeCount={activeCount("labels")}>
          {labels.map((l) => (
            <CheckItem
              key={l} label={`#${l}`} checked={filters.labels.includes(l)}
              onChange={() => toggleArrayItem("labels", l)}
            />
          ))}
        </FilterDropdown>

        {/* Due Date */}
        <FilterDropdown
          label="Due Date" icon="📅"
          activeCount={(filters.dateRange?.from || filters.dateRange?.to) ? 1 : 0}
        >
          <DateRangeFilter
            value={filters.dateRange}
            onChange={(v) => update("dateRange", v)}
          />
        </FilterDropdown>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid #2d2d3f",
            background: "rgba(255,255,255,0.05)", color: "#c9d1d9",
            fontSize: 13, cursor: "pointer", outline: "none", fontFamily: "inherit",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Show Completed */}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8b949e", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={filters.showCompleted}
            onChange={(e) => update("showCompleted", e.target.checked)}
            style={{ accentColor: "#4f46e5" }}
          />
          Show done
        </label>
      </div>

      {/* Active filter chips */}
      <ActiveFilters filters={filters} onRemove={removeFilter} onClearAll={clearAll} />
    </div>
  );
}