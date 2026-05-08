// flowdesk-frontend/components/tasks/TaskModal.jsx

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
const PRIORITY_COLORS = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };
const STATUS_COLORS = {
  Backlog: "#6e7681", Todo: "#3b82f6",
  "In Progress": "#f59e0b", "In Review": "#8b5cf6", Done: "#22c55e",
};
const MOCK_ASSIGNEES = [
  { id: 1, name: "Alice Johnson", role: "Designer" },
  { id: 2, name: "Bob Smith",    role: "Engineer" },
  { id: 3, name: "Carol White",  role: "PM" },
  { id: 4, name: "David Lee",    role: "Engineer" },
];
const MOCK_LABELS = [
  { id: 1, name: "bug",      color: "#ef4444" },
  { id: 2, name: "feature",  color: "#3b82f6" },
  { id: 3, name: "design",   color: "#8b5cf6" },
  { id: 4, name: "backend",  color: "#14b8a6" },
  { id: 5, name: "urgent",   color: "#f97316" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
const AVATAR_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed"];
function avatarColor(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 28 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatarColor(user?.name || ""),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}
    >
      {getInitials(user?.name)}
    </div>
  );
}

// ─── Pill Select ──────────────────────────────────────────────────────────────
function PillSelect({ options, value, onChange, colorMap }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const color = colorMap?.[opt] || "#4f46e5";
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
              background: active ? `${color}33` : "rgba(255,255,255,0.05)",
              color: active ? color : "#8b949e",
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              outline: active ? `1.5px solid ${color}` : "1.5px solid transparent",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Label Chip ───────────────────────────────────────────────────────────────
function LabelChip({ label, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        background: `${label.color}22`, color: label.color,
        border: `1px solid ${label.color}55`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: label.color }} />
      {label.name}
      {onRemove && (
        <button
          onClick={() => onRemove(label.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: label.color, fontSize: 13, lineHeight: 1 }}
        >×</button>
      )}
    </span>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #1e1e2e" }}>
      <div style={{ width: 100, fontSize: 12, color: "#6e7681", fontWeight: 600, paddingTop: 4, flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Checklist ────────────────────────────────────────────────────────────────
function Checklist({ items, onChange }) {
  const [newItem, setNewItem] = useState("");

  function toggleItem(id) {
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }
  function deleteItem(id) {
    onChange(items.filter((i) => i.id !== id));
  }
  function addItem() {
    if (!newItem.trim()) return;
    onChange([...items, { id: Date.now(), text: newItem.trim(), done: false }]);
    setNewItem("");
  }

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div>
      {items.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6e7681", marginBottom: 4 }}>
            <span>Progress</span><span>{done}/{items.length} ({pct}%)</span>
          </div>
          <div style={{ height: 4, background: "#2d2d3f", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : "#4f46e5", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
      )}
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <input
            type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)}
            style={{ accentColor: "#4f46e5", width: 14, height: 14 }}
          />
          <span
            style={{
              flex: 1, fontSize: 13, color: item.done ? "#6e7681" : "#c9d1d9",
              textDecoration: item.done ? "line-through" : "none",
            }}
          >
            {item.text}
          </span>
          <button
            onClick={() => deleteItem(item.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6e7681", fontSize: 13, padding: "0 4px" }}
          >×</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add checklist item…"
          onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
          style={{
            flex: 1, padding: "5px 8px", background: "#161622",
            border: "1px solid #2d2d3f", borderRadius: 6,
            color: "#e6edf3", fontSize: 12, outline: "none", fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
          onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
        />
        <button
          onClick={addItem}
          disabled={!newItem.trim()}
          style={{
            padding: "5px 10px", borderRadius: 6, border: "none",
            background: newItem.trim() ? "#4f46e5" : "#2d2d3f",
            color: "#fff", fontSize: 12, cursor: newItem.trim() ? "pointer" : "not-allowed",
          }}
        >Add</button>
      </div>
    </div>
  );
}

// ─── Assignee Picker ──────────────────────────────────────────────────────────
function AssigneePicker({ assignees, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function toggle(a) {
    const next = selected.some((s) => s.id === a.id)
      ? selected.filter((s) => s.id !== a.id)
      : [...selected, a];
    onChange(next);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", flexWrap: "wrap" }}
      >
        {selected.length === 0 ? (
          <span style={{ fontSize: 12, color: "#6e7681" }}>+ Assign</span>
        ) : (
          selected.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20 }}>
              <Avatar user={a} size={18} />
              <span style={{ fontSize: 12, color: "#c9d1d9" }}>{a.name}</span>
            </div>
          ))
        )}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#1a1a2e", border: "1px solid #2d2d3f", borderRadius: 8, zIndex: 500, minWidth: 180, padding: 6, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {assignees.map((a) => (
            <div
              key={a.id}
              onClick={() => toggle(a)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <input type="checkbox" checked={selected.some((s) => s.id === a.id)} readOnly style={{ accentColor: "#4f46e5" }} />
              <Avatar user={a} size={22} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "#6e7681" }}>{a.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #1e1e2e", marginBottom: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "10px 16px", border: "none", background: "none",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: active === t.key ? "#818cf8" : "#6e7681",
            borderBottom: active === t.key ? "2px solid #4f46e5" : "2px solid transparent",
            transition: "all 0.15s",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── DEFAULT TASK ─────────────────────────────────────────────────────────────
const DEFAULT_TASK = {
  id: null,
  title: "",
  description: "",
  status: "Todo",
  priority: "Medium",
  assignees: [],
  labels: [],
  dueDate: "",
  estimatedHours: "",
  checklist: [],
  attachments: [],
  createdAt: new Date().toISOString(),
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskModal({
  isOpen = true,
  task: initialTask = null,
  onClose,
  onSave,
  onDelete,
  assignees = MOCK_ASSIGNEES,
  labels = MOCK_LABELS,
  mode = "edit",
}) {
  const [task, setTask] = useState({ ...DEFAULT_TASK, ...(initialTask || {}) });
  const [tab, setTab] = useState("details");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef();

  useEffect(() => {
    setTask({ ...DEFAULT_TASK, ...(initialTask || {}) });
    setDirty(false);
    setTab("details");
  }, [initialTask, isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dirty]);

  function update(key, value) {
    setTask((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleClose() {
    if (dirty && !window.confirm("You have unsaved changes. Discard?")) return;
    onClose?.();
  }

  async function handleSave() {
    if (!task.title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSave?.({ ...task, id: task.id || Date.now() });
    setSaving(false);
    setDirty(false);
    onClose?.();
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) handleClose();
  }

  function toggleLabel(label) {
    const next = task.labels.some((l) => l.id === label.id)
      ? task.labels.filter((l) => l.id !== label.id)
      : [...task.labels, label];
    update("labels", next);
  }

  if (!isOpen) return null;

  const isNew = !task.id;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(4px)",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#0d0d1a", borderRadius: 14, width: "100%",
          maxWidth: 680, maxHeight: "90vh", display: "flex",
          flexDirection: "column", border: "1px solid #2d2d3f",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #1e1e2e",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{isNew ? "✨" : "📋"}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3" }}>
              {isNew ? "New Task" : "Edit Task"}
            </span>
            {dirty && <span style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.12)", padding: "2px 6px", borderRadius: 4 }}>Unsaved</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!isNew && (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #2d2d3f",
                  background: "none", color: "#ef4444", fontSize: 12, cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                width: 28, height: 28, borderRadius: 6, border: "none",
                background: "rgba(255,255,255,0.07)", color: "#8b949e",
                cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>
        </div>

        {/* Title Input */}
        <div style={{ padding: "16px 20px 0" }}>
          <input
            value={task.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Task title…"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "none", border: "none", outline: "none",
              fontSize: 20, fontWeight: 700, color: "#e6edf3",
              fontFamily: "inherit", lineHeight: 1.3,
            }}
            readOnly={mode === "view"}
          />
        </div>

        {/* Tabs */}
        <div style={{ padding: "0 20px" }}>
          <TabBar
            tabs={[
              { key: "details", label: "📋 Details" },
              { key: "checklist", label: "✅ Checklist" },
              { key: "activity", label: "📝 Activity" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

          {tab === "details" && (
            <div>
              {/* Status */}
              <Field label="Status">
                <PillSelect options={STATUSES} value={task.status} onChange={(v) => update("status", v)} colorMap={STATUS_COLORS} />
              </Field>

              {/* Priority */}
              <Field label="Priority">
                <PillSelect options={PRIORITIES} value={task.priority} onChange={(v) => update("priority", v)} colorMap={PRIORITY_COLORS} />
              </Field>

              {/* Assignees */}
              <Field label="Assignees">
                <AssigneePicker assignees={assignees} selected={task.assignees} onChange={(v) => update("assignees", v)} />
              </Field>

              {/* Labels */}
              <Field label="Labels">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {task.labels.map((l) => (
                    <LabelChip key={l.id} label={l} onRemove={(id) => update("labels", task.labels.filter((lb) => lb.id !== id))} />
                  ))}
                  <div style={{ position: "relative" }}>
                    <select
                      onChange={(e) => {
                        const found = labels.find((l) => l.id === +e.target.value);
                        if (found) toggleLabel(found);
                        e.target.value = "";
                      }}
                      style={{
                        padding: "2px 8px", borderRadius: 20, border: "1px dashed #2d2d3f",
                        background: "none", color: "#6e7681", fontSize: 12, cursor: "pointer", outline: "none",
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add label</option>
                      {labels.filter((l) => !task.labels.some((s) => s.id === l.id)).map((l) => (
                        <option key={l.id} value={l.id} style={{ background: "#1a1a2e" }}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Field>

              {/* Due Date */}
              <Field label="Due Date">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => update("dueDate", e.target.value)}
                    style={{
                      background: "#161622", border: `1px solid ${isOverdue ? "#ef4444" : "#2d2d3f"}`,
                      borderRadius: 6, color: isOverdue ? "#ef4444" : "#e6edf3",
                      fontSize: 12, padding: "4px 8px", outline: "none", fontFamily: "inherit",
                    }}
                  />
                  {isOverdue && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>⚠ Overdue</span>}
                  {task.dueDate && !isOverdue && task.status !== "Done" && (
                    <span style={{ fontSize: 11, color: "#6e7681" }}>{formatDate(task.dueDate)}</span>
                  )}
                </div>
              </Field>

              {/* Estimated Hours */}
              <Field label="Estimate">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="number" min={0} step={0.5}
                    value={task.estimatedHours}
                    onChange={(e) => update("estimatedHours", e.target.value)}
                    placeholder="0"
                    style={{
                      width: 70, padding: "4px 8px", background: "#161622",
                      border: "1px solid #2d2d3f", borderRadius: 6, color: "#e6edf3",
                      fontSize: 12, outline: "none", fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                    onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
                  />
                  <span style={{ fontSize: 12, color: "#6e7681" }}>hours</span>
                </div>
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  value={task.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Add a description…"
                  rows={4}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "8px 10px",
                    background: "#161622", border: "1px solid #2d2d3f",
                    borderRadius: 8, color: "#e6edf3", fontSize: 13,
                    resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                  onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
                />
              </Field>
            </div>
          )}

          {tab === "checklist" && (
            <div style={{ paddingTop: 16 }}>
              <Checklist
                items={task.checklist}
                onChange={(v) => update("checklist", v)}
              />
            </div>
          )}

          {tab === "activity" && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ textAlign: "center", color: "#6e7681", fontSize: 13, padding: 32 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
                Activity log coming soon.<br />
                <span style={{ fontSize: 11 }}>Comments and history will appear here.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px", borderTop: "1px solid #1e1e2e",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span style={{ fontSize: 11, color: "#6e7681" }}>
            {task.createdAt ? `Created ${formatDate(task.createdAt)}` : ""}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleClose}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "1px solid #2d2d3f",
                background: "none", color: "#8b949e", fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!task.title.trim() || saving}
              style={{
                padding: "7px 20px", borderRadius: 8, border: "none",
                background: task.title.trim() && !saving ? "#4f46e5" : "#2d2d3f",
                color: task.title.trim() && !saving ? "#fff" : "#6e7681",
                fontSize: 13, fontWeight: 600, cursor: task.title.trim() && !saving ? "pointer" : "not-allowed",
                transition: "all 0.2s", minWidth: 80,
              }}
            >
              {saving ? "Saving…" : isNew ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "#1a1a2e", border: "1px solid #ef4444", borderRadius: 12,
              padding: 24, maxWidth: 340, textAlign: "center",
              boxShadow: "0 16px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#e6edf3", marginBottom: 6 }}>Delete this task?</div>
            <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #2d2d3f", background: "none", color: "#8b949e", cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={() => { onDelete?.(task.id); setConfirmDelete(false); onClose?.(); }}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >Delete Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}