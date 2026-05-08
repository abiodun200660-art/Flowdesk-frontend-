// flowdesk-frontend/components/tasks/TaskLabels.jsx

import { useState, useRef, useEffect } from "react";

// ─── Preset label colours ─────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#8b5cf6","#ec4899","#6366f1","#64748b",
];

// ─── Default label library ────────────────────────────────────────────────────
const DEFAULT_LABEL_LIBRARY = [
  { id: 1, name: "bug",       color: "#ef4444" },
  { id: 2, name: "feature",   color: "#3b82f6" },
  { id: 3, name: "design",    color: "#8b5cf6" },
  { id: 4, name: "backend",   color: "#14b8a6" },
  { id: 5, name: "urgent",    color: "#f97316" },
  { id: 6, name: "docs",      color: "#64748b" },
  { id: 7, name: "refactor",  color: "#eab308" },
  { id: 8, name: "blocked",   color: "#dc2626" },
];

// ─── Single Label Chip ────────────────────────────────────────────────────────
export function LabelChip({ label, onRemove, size = "md" }) {
  const sizes = { sm: { fontSize: 10, padding: "1px 6px" }, md: { fontSize: 12, padding: "2px 8px" }, lg: { fontSize: 13, padding: "4px 10px" } };
  const s = sizes[size] || sizes.md;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: s.padding, borderRadius: 20, fontSize: s.fontSize,
        fontWeight: 600, background: `${label.color}22`,
        color: label.color, border: `1px solid ${label.color}55`,
        userSelect: "none",
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: label.color, flexShrink: 0 }}
      />
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(label.id); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 0, color: label.color, fontSize: s.fontSize + 2,
            lineHeight: 1, opacity: 0.7, display: "flex", alignItems: "center",
          }}
        >×</button>
      )}
    </span>
  );
}

// ─── Color Swatch Picker ──────────────────────────────────────────────────────
function ColorPicker({ selected, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 20, height: 20, borderRadius: "50%", background: c,
            border: selected === c ? "2px solid #fff" : "2px solid transparent",
            cursor: "pointer", padding: 0,
            boxShadow: selected === c ? `0 0 0 2px ${c}` : "none",
            transition: "all 0.15s",
          }}
        />
      ))}
      <input
        type="color" value={selected} onChange={(e) => onChange(e.target.value)}
        style={{ width: 20, height: 20, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, background: "none" }}
        title="Custom color"
      />
    </div>
  );
}

// ─── Label Creator ────────────────────────────────────────────────────────────
function LabelCreator({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({ id: Date.now(), name: name.trim().toLowerCase(), color });
    setName("");
    setColor(PRESET_COLORS[0]);
  }

  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid #2d2d3f", marginTop: 8 }}>
      <div style={{ fontSize: 11, color: "#6e7681", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Create new label
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: `${color}33`, border: `1px solid ${color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Label name…"
          maxLength={24}
          style={{
            flex: 1, padding: "5px 8px", background: "#161622",
            border: "1px solid #2d2d3f", borderRadius: 6, color: "#e6edf3",
            fontSize: 12, outline: "none", fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
          onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") onCancel(); }}
          autoFocus
        />
      </div>
      <ColorPicker selected={color} onChange={setColor} />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          style={{
            flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
            background: name.trim() ? "#4f46e5" : "#2d2d3f",
            color: name.trim() ? "#fff" : "#6e7681",
            fontSize: 12, fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed",
          }}
        >
          Create
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "5px 10px", borderRadius: 6, border: "1px solid #2d2d3f",
            background: "none", color: "#8b949e", fontSize: 12, cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Label Dropdown Panel ─────────────────────────────────────────────────────
function LabelDropdown({ library, selected, onToggle, onCreate, onDeleteFromLibrary }) {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const filtered = library.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      style={{
        position: "absolute", top: "calc(100% + 6px)", left: 0,
        background: "#1a1a2e", border: "1px solid #2d2d3f",
        borderRadius: 10, zIndex: 400, width: 240,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)", padding: 8,
      }}
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search labels…"
        style={{
          width: "100%", boxSizing: "border-box", padding: "5px 8px",
          background: "#161622", border: "1px solid #2d2d3f",
          borderRadius: 6, color: "#e6edf3", fontSize: 12,
          outline: "none", marginBottom: 6, fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
        onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
        autoFocus
      />

      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "8px 0", textAlign: "center", fontSize: 12, color: "#6e7681" }}>
            No labels found
          </div>
        )}
        {filtered.map((label) => {
          const isSelected = selected.some((s) => s.id === label.id);
          return (
            <div
              key={label.id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 4px", borderRadius: 6, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <input
                type="checkbox" checked={isSelected} readOnly
                style={{ accentColor: label.color, width: 13, height: 13 }}
                onClick={() => onToggle(label)}
              />
              <span
                style={{ width: 8, height: 8, borderRadius: "50%", background: label.color, flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 12, color: "#c9d1d9" }} onClick={() => onToggle(label)}>
                {label.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteFromLibrary(label.id); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#6e7681", fontSize: 12, padding: "0 2px",
                  opacity: 0, transition: "opacity 0.15s",
                }}
                title="Delete label"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >🗑</button>
            </div>
          );
        })}
      </div>

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          style={{
            width: "100%", marginTop: 8, padding: "6px 0",
            borderRadius: 6, border: "1px dashed #2d2d3f",
            background: "none", color: "#6e7681", fontSize: 12,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#6e7681"; }}
        >
          + Create new label
        </button>
      ) : (
        <LabelCreator
          onCreate={(label) => { onCreate(label); setCreating(false); }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskLabels({
  selectedLabels: externalSelected,
  labelLibrary: externalLibrary,
  onChange,
  onLibraryChange,
  maxVisible = 5,
  readOnly = false,
}) {
  const [selected, setSelected] = useState(externalSelected || []);
  const [library, setLibrary] = useState(externalLibrary || DEFAULT_LABEL_LIBRARY);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleLabel(label) {
    const next = selected.some((s) => s.id === label.id)
      ? selected.filter((s) => s.id !== label.id)
      : [...selected, label];
    setSelected(next);
    onChange?.(next);
  }

  function removeLabel(id) {
    const next = selected.filter((s) => s.id !== id);
    setSelected(next);
    onChange?.(next);
  }

  function createLabel(label) {
    const nextLib = [...library, label];
    setLibrary(nextLib);
    onLibraryChange?.(nextLib);
    toggleLabel(label);
  }

  function deleteFromLibrary(id) {
    const nextLib = library.filter((l) => l.id !== id);
    setLibrary(nextLib);
    onLibraryChange?.(nextLib);
    const nextSel = selected.filter((s) => s.id !== id);
    setSelected(nextSel);
    onChange?.(nextSel);
  }

  const visible = selected.slice(0, maxVisible);
  const overflow = selected.length - maxVisible;

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <div ref={ref} style={{ position: "relative", display: "inline-flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        {visible.map((label) => (
          <LabelChip
            key={label.id}
            label={label}
            onRemove={readOnly ? undefined : removeLabel}
          />
        ))}

        {overflow > 0 && (
          <span
            style={{
              fontSize: 11, color: "#8b949e", background: "rgba(255,255,255,0.06)",
              border: "1px solid #2d2d3f", borderRadius: 20, padding: "2px 8px",
              cursor: "pointer",
            }}
            onClick={() => !readOnly && setOpen(true)}
          >
            +{overflow} more
          </span>
        )}

        {!readOnly && (
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 20, border: "1px dashed #2d2d3f",
              background: "none", color: "#6e7681", fontSize: 12,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#6e7681"; }}
          >
            🏷️ {selected.length === 0 ? "Add labels" : "Edit"}
          </button>
        )}

        {open && (
          <LabelDropdown
            library={library}
            selected={selected}
            onToggle={toggleLabel}
            onCreate={createLabel}
            onDeleteFromLibrary={deleteFromLibrary}
          />
        )}
      </div>
    </div>
  );
}