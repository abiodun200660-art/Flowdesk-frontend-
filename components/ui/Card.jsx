'use client'

import { useState } from "react";

export default function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = "20px 24px",
  hoverable = false,
  selected = false,
  onClick,
  style: extraStyle = {},
  bodyStyle = {},
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: "#13131f",
        border: 1px solid ${selected ? "#4f46e5" : hovered ? "#2d2d3f" : "#1e1e2e"},
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.18s ease",
        cursor: onClick ? "pointer" : "default",
        transform: hoverable && hovered ? "translateY(-2px)" : "none",
        boxShadow: hoverable && hovered ? "0 8px 32px rgba(0,0,0,0.35)" : "none",
        outline: selected ? "1px solid #4f46e544" : "none",
        ...extraStyle,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #1e1e2e",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            {icon && (
              <span
                style={{
                  fontSize: 18,
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(79,70,229,0.1)",
                  borderRadius: 8,
                }}
              >
                {icon}
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              {title && (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#e6edf3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: 12, color: "#6e7681", marginTop: 1 }}>{subtitle}</div>
              )}
            </div>
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}

      <div style={{ padding, ...bodyStyle }}>{children}</div>
    </div>
  );
}
