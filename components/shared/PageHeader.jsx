// flowdesk-frontend/components/shared/PageHeader.jsx

"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Breadcrumb Trail ─────────────────────────────────────────────────────────
function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
        flexWrap: "wrap",
      }}
    >
      {items.map((crumb, i) => {
        const isLast = i === items.length - 1;
        return (
          <span
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {i > 0 && (
              <span
                style={{
                  color: "#3d3d55",
                  fontSize: 13,
                  userSelect: "none",
                  lineHeight: 1,
                }}
              >
                ›
              </span>
            )}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                style={{
                  fontSize: 12,
                  color: "#6e7681",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
              >
                {crumb.icon && <span style={{ fontSize: 13 }}>{crumb.icon}</span>}
                {crumb.label}
              </Link>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  color: isLast ? "#8b949e" : "#6e7681",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {crumb.icon && <span style={{ fontSize: 13 }}>{crumb.icon}</span>}
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    active:      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",    border: "#22c55e44",  dot: true  },
    draft:       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   border: "#f59e0b44",  dot: false },
    archived:    { color: "#6e7681", bg: "rgba(110,118,129,0.12)",  border: "#6e768144",  dot: false },
    beta:        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",   border: "#8b5cf644",  dot: false },
    new:         { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",   border: "#3b82f644",  dot: false },
    deprecated:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    border: "#ef444444",  dot: false },
  };
  const cfg = configs[status?.toLowerCase()] || configs.active;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        userSelect: "none",
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.color,
            animation: "phPulse 1.8s ease-in-out infinite",
          }}
        />
      )}
      {status}
    </span>
  );
}

// ─── Count Pill ───────────────────────────────────────────────────────────────
function CountPill({ count }) {
  if (count === undefined || count === null) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22,
        height: 22,
        padding: "0 6px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: "rgba(255,255,255,0.08)",
        color: "#8b949e",
        border: "1px solid #2d2d3f",
        userSelect: "none",
      }}
    >
      {count > 999 ? "999+" : count}
    </span>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, activeTab, onTabChange }) {
  if (!tabs || tabs.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        marginTop: 16,
        borderBottom: "1px solid #1e1e2e",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            disabled={tab.disabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              border: "none",
              borderBottom: active ? "2px solid #4f46e5" : "2px solid transparent",
              background: "none",
              color: active ? "#818cf8" : tab.disabled ? "#3d3d55" : "#6e7681",
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              cursor: tab.disabled ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              marginBottom: -1,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!active && !tab.disabled) e.currentTarget.style.color = "#c9d1d9";
            }}
            onMouseLeave={(e) => {
              if (!active && !tab.disabled) e.currentTarget.style.color = "#6e7681";
            }}
          >
            {tab.icon && <span style={{ fontSize: 14 }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && <CountPill count={tab.count} />}
            {tab.badge && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 20,
                  background: "rgba(79,70,229,0.2)",
                  color: "#818cf8",
                  border: "1px solid #4f46e544",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Meta Item ────────────────────────────────────────────────────────────────
function MetaItem({ icon, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "#6e7681",
      }}
    >
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      {label}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PageHeader({
  // Core
  title,
  subtitle,
  icon,

  // Decorators
  badge,
  status,
  count,

  // Breadcrumbs
  breadcrumbs,

  // Meta row (small pieces of info below the title)
  meta,

  // Right-side actions (pass JSX nodes)
  actions,

  // Tabs
  tabs,
  activeTab,
  onTabChange,

  // Appearance
  divider = true,
  compact = false,
  sticky = false,

  // Back button
  backHref,
  backLabel = "Back",

  // Optional description block
  description,

  // Optional highlight banner (e.g. trial warning)
  banner,
}) {
  const [backHovered, setBackHovered] = useState(false);

  return (
    <div
      style={{
        marginBottom: tabs ? 0 : 24,
        position: sticky ? "sticky" : "static",
        top: sticky ? 56 : "auto",
        background: sticky ? "#0d0d1a" : "transparent",
        zIndex: sticky ? 8 : "auto",
        paddingBottom: sticky ? 0 : 0,
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Optional banner ── */}
      {banner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            borderRadius: 9,
            background: banner.bg || "rgba(245,158,11,0.1)",
            border: `1px solid ${banner.border || "#f59e0b44"}`,
            color: banner.color || "#f59e0b",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {banner.icon && <span style={{ fontSize: 16 }}>{banner.icon}</span>}
          <span style={{ flex: 1 }}>{banner.message}</span>
          {banner.action && (
            <button
              onClick={banner.action.onClick}
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                border: `1px solid ${banner.color || "#f59e0b"}55`,
                background: `${banner.color || "#f59e0b"}18`,
                color: banner.color || "#f59e0b",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {banner.action.label}
            </button>
          )}
        </div>
      )}

      {/* ── Breadcrumbs ── */}
      <Breadcrumbs items={breadcrumbs} />

      {/* ── Back button ── */}
      {backHref && (
        <Link
          href={backHref}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: backHovered ? "#818cf8" : "#6e7681",
            textDecoration: "none",
            marginBottom: 10,
            transition: "color 0.15s",
          }}
        >
          <span style={{ fontSize: 14, transition: "transform 0.15s", transform: backHovered ? "translateX(-2px)" : "none" }}>←</span>
          {backLabel}
        </Link>
      )}

      {/* ── Main row: title + actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Left block */}
        <div style={{ minWidth: 0, flex: 1 }}>

          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: subtitle || meta || description ? 4 : 0,
            }}
          >
            {icon && (
              <span
                style={{
                  fontSize: compact ? 18 : 22,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {icon}
              </span>
            )}

            <h2
              style={{
                margin: 0,
                fontSize: compact ? 16 : 20,
                fontWeight: 800,
                color: "#e6edf3",
                letterSpacing: -0.3,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {title}
            </h2>

            {count !== undefined && <CountPill count={count} />}

            {status && <StatusBadge status={status} />}

            {badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(79,70,229,0.15)",
                  color: "#818cf8",
                  border: "1px solid #4f46e544",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                color: "#6e7681",
                lineHeight: 1.55,
                maxWidth: 600,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "#8b949e",
                lineHeight: 1.65,
                maxWidth: 640,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e1e2e",
                borderRadius: 8,
              }}
            >
              {description}
            </p>
          )}

          {/* Meta row */}
          {meta && meta.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 8,
              }}
            >
              {meta.map((item, i) => (
                <MetaItem key={i} icon={item.icon} label={item.label} />
              ))}
            </div>
          )}
        </div>

        {/* Right — actions */}
        {actions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              flexWrap: "wrap",
              paddingTop: 2,
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {/* ── Divider (no tabs) ── */}
      {divider && !tabs && (
        <div
          style={{
            height: 1,
            background: "#1e1e2e",
            marginTop: compact ? 12 : 16,
          }}
        />
      )}

      {/* ── Tab bar ── */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      <style>{`
        @keyframes phPulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}