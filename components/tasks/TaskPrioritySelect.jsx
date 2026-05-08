// flowdesk-frontend/components/tasks/TaskPrioritySelect.jsx

import { useState, useRef, useEffect } from "react";

// ─── Priority Config ───────────────────────────────────────────────────────────
const PRIORITIES = [
  {
    value: "Critical",
    label: "Critical",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: "🔴",
    description: "Immediate attention required",
  },
  {
    value: "High",
    label: "High",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "🟠",
    description: "Important, address soon",
  },
  {
    value: "Medium",
    label: "Medium",
    color: "#eab308",
    bg: "rgba(234,179,8,0.12)",
    icon: "🟡",
    description: "Normal priority",
  },
  {
    value: "Low",
    label: "Low",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "🟢",
    description: "Not urgent",
  },
  {
    value: "None",
    label: "No Priority",
    color: "#6e7681",
    bg: "rgba(110,118,129,0.1)",
    icon: "⚪",
    description: "Priority not set",
  },
];

function getPriority(value) {
  return PRIORITIES.find((p) => p.value === value) || PRIORITIES[4];
}

// ─── Priority Badge (display only) ───────────────────────────────────────────
export function PriorityBadge({ value, size = "md" }) {
  const p = getPriority(value);
  const sizes = {
    sm: { fontSize: 10, padding: "1px 6px", dotSize: 6 },
    md: { fontSize: 12, padding: "3px 8px", dotSize: 8 },
    lg: { fontSize: 13, padding: "4px 12px", dotSize: 10 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: s.padding, borderRadius: 20, fontSize: s.fontSize,
        fontWeight: 600, background: p.bg, color: p.color,
        border: `1px solid ${p.color}44`, userSelect: "none",
      }}
    >
      <span style={{ width: s.dotSize, height: s.dotSize, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
      {p.label}
    </span>
  );
}

// ─── Dropdown Option ──────────────────────────────────────────────────────────
function PriorityOption({ priority, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(priority.value)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
        borderRadius: 7, cursor: "pointer", transition: "background 0.15s",
        background: selected ? priority.bg : hovered ? "rgba(255,255,255,0.05)" : "none",
        outline: selected ? `1px solid ${priority.color}44` : "none",
      }}
    >
      <span style={{ fontSize: 16 }}>{priority.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: selected ? priority.color : "#c9d1d9" }}>
          {priority.label}
        </div>
        <div style={{ fontSize: 11, color: "#6e7681" }}>{priority.description}</div>
      </div>
      {selected && (
        <span style={{ fontSize: 14, color: priority.color }}>✓</span>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskPrioritySelect({
  value = "Medium",
  onChange,
  disabled = false,
  variant = "default", // "default" | "compact" | "pill"
  allowNone = true,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const current = getPriority(value);
  const options = allowNone ? PRIORITIES : PRIORITIES.filter((p) => p.value !== "None");

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function select(val) {
    onChange?.(val);
    setOpen(false);
  }

  // Trigger button styles per variant
  const triggerStyle = (() => {
    const base = {
      display: "inline-flex", alignItems: "center", gap: 6,
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", transition: "all 0.15s", outline: "none",
      opacity: disabled ? 0.5 : 1,
    };
    if (variant === "compact") return {
      ...base,
      background: "none", color: current.color, fontSize: 13, fontWeight: 700, padding: "2px 0",
    };
    if (variant === "pill") return {
      ...base,
      background: current.bg, color: current.color,
      fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20, border: `1px solid ${current.color}44`,
    };
    return {
      ...base,
      background: open ? current.bg : "rgba(255,255,255,0.05)",
      color: open ? current.color : "#c9d1d9",
      padding: "6px 12px", borderRadius: 8,
      border: `1px solid ${open ? current.color + "66" : "#2d2d3f"}`,
      fontSize: 13, fontWeight: 500,
    };
  })();

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-block", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}
    >
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        style={triggerStyle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {variant === "compact" ? (
          <>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: current.color }} />
            <span>{current.label}</span>
          </>
        ) : (
          <>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: current.color, flexShrink: 0 }} />
            <span>{current.label}</span>
            {variant !== "pill" && (
              <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
            )}
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#1a1a2e", border: "1px solid #2d2d3f",
            borderRadius: 10, zIndex: 500, width: 220,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)", padding: 6,
          }}
        >
          <div style={{ fontSize: 10, color: "#6e7681", textTransform: "uppercase", letterSpacing: 0.8, padding: "4px 10px 6px", fontWeight: 600 }}>
            Set Priority
          </div>
          {options.map((p) => (
            <PriorityOption
              key={p.value}
              priority={p}
              selected={value === p.value}
              onClick={select}
            />
          ))}
        </div>
      )}
    </div>
  );
}