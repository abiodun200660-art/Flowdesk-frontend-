// flowdesk-frontend/components/ui/Button.jsx

import { useState } from "react";

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    hoverOpacity: 0.88,
    shadow: "0 4px 16px rgba(79,70,229,0.35)",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    color: "#c9d1d9",
    border: "1px solid #2d2d3f",
    hoverBackground: "rgba(255,255,255,0.1)",
  },
  danger: {
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "1px solid #ef444444",
    hoverBackground: "rgba(239,68,68,0.2)",
  },
  ghost: {
    background: "none",
    color: "#8b949e",
    border: "none",
    hoverBackground: "rgba(255,255,255,0.06)",
  },
  success: {
    background: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    border: "1px solid #22c55e44",
    hoverBackground: "rgba(34,197,94,0.2)",
  },
};

const SIZES = {
  xs: { padding: "3px 8px",   fontSize: 11, borderRadius: 6,  height: 24 },
  sm: { padding: "5px 12px",  fontSize: 12, borderRadius: 7,  height: 30 },
  md: { padding: "7px 16px",  fontSize: 13, borderRadius: 8,  height: 36 },
  lg: { padding: "10px 22px", fontSize: 14, borderRadius: 9,  height: 44 },
  xl: { padding: "13px 28px", fontSize: 15, borderRadius: 10, height: 52 },
};

function Spinner({ size = 14, color = "currentColor" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: 2px solid ${color}33,
        borderTopColor: color,
        animation: "btn-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  onClick,
  type = "button",
  title,
  style: extraStyle = {},
}) {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const bg = (() => {
    if (isDisabled) return "rgba(255,255,255,0.04)";
    if (hovered && v.hoverBackground) return v.hoverBackground;
    if (hovered && v.hoverOpacity) return v.background;
    return v.background;
  })();

  return (
    <>
      <button
        type={type}
        onClick={isDisabled ? undefined : onClick}
        title={title}
        disabled={isDisabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: s.padding,
          fontSize: s.fontSize,
          borderRadius: s.borderRadius,
          height: s.height,
          border: isDisabled ? "1px solid #1e1e2e" : (v.border || "none"),
          background: bg,
          color: isDisabled ? "#6e7681" : v.color,
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: hovered && v.hoverOpacity ? v.hoverOpacity : 1,
          boxShadow: !isDisabled && hovered && v.shadow ? v.shadow : "none",
          transition: "all 0.18s ease",
          fontFamily: "inherit",
          width: fullWidth ? "100%" : "auto",
          whiteSpace: "nowrap",
          userSelect: "none",
          ...extraStyle,
        }}
      >
        {loading ? (
          <Spinner size={s.fontSize} color={isDisabled ? "#6e7681" : v.color} />
        ) : icon ? (
          <span style={{ fontSize: s.fontSize + 1, flexShrink: 0 }}>{icon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && iconRight && (
          <span style={{ fontSize: s.fontSize + 1, flexShrink: 0 }}>{iconRight}</span>
        )}
      </button>
      <style>{@keyframes btn-spin { to { transform: rotate(360deg); } }}</style>
    </>
  );
}