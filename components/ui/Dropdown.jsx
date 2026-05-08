// flowdesk-frontend/components/ui/Dropdown.jsx

import { useState, useRef, useEffect } from "react";

function DropdownItem({ item, onSelect, closeOnSelect }) {
  const [hovered, setHovered] = useState(false);
  if (item.type === "divider") {
    return <div style={{ height: 1, background: "#1e1e2e", margin: "4px 0" }} />;
  }
  if (item.type === "label") {
    return (
      <div style={{ fontSize: 10, fontWeight: 700, color: "#6e7681", textTransform: "uppercase", letterSpacing: 0.8, padding: "6px 10px 3px" }}>
        {item.label}
      </div>
    );
  }
  return (
    <div
      onClick={() => { if (!item.disabled) { onSelect?.(item); closeOnSelect?.(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "7px 10px",
        borderRadius: 7,
        cursor: item.disabled ? "not-allowed" : "pointer",
        background: hovered && !item.disabled ? "rgba(255,255,255,0.05)" : "none",
        opacity: item.disabled ? 0.4 : 1,
        transition: "background 0.15s",
      }}
    >
      {item.icon && <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: item.danger ? "#f87171" : "#c9d1d9", fontWeight: 500 }}>
          {item.label}
        </div>
        {item.description && (
          <div style={{ fontSize: 11, color: "#6e7681", marginTop: 1 }}>{item.description}</div>
        )}
      </div>
      {item.shortcut && (
        <span style={{ fontSize: 10, color: "#6e7681", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>
          {item.shortcut}
        </span>
      )}
      {item.checked !== undefined && (
        <span style={{ color: "#4f46e5", fontSize: 13 }}>{item.checked ? "✓" : ""}</span>
      )}
    </div>
  );
}

export default function Dropdown({
  trigger,
  items = [],
  align = "left",
  width = 200,
  onSelect,
  closeOnSelect = true,
  maxHeight = 320,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align === "right" ? "right" : "left"]: 0,
            width,
            background: "#1a1a2e",
            border: "1px solid #2d2d3f",
            borderRadius: 10,
            zIndex: 600,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            padding: 5,
            maxHeight,
            overflowY: "auto",
            animation: "dropIn 0.15s ease both",
          }}
        >
          {items.map((item, i) => (
            <DropdownItem
              key={item.id || i}
              item={item}
              onSelect={onSelect}
              closeOnSelect={closeOnSelect ? () => setOpen(false) : undefined}
            />
          ))}
        </div>
      )}
      <style>{@keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }}</style>
    </div>
  );
}
