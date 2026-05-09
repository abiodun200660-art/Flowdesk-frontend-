'use client'

import { useState, useEffect, useRef } from "react";

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    key: "dark",
    label: "Dark",
    icon: "🌙",
    description: "Easy on the eyes",
    vars: {
      "--color-bg":         "#0d0d1a",
      "--color-surface":    "#13131f",
      "--color-surface-2":  "#1a1a2e",
      "--color-border":     "#1e1e2e",
      "--color-border-2":   "#2d2d3f",
      "--color-text":       "#e6edf3",
      "--color-text-muted": "#8b949e",
      "--color-text-faint": "#6e7681",
    },
  },
  {
    key: "light",
    label: "Light",
    icon: "☀️",
    description: "Clean and bright",
    vars: {
      "--color-bg":         "#f4f6fb",
      "--color-surface":    "#ffffff",
      "--color-surface-2":  "#f0f2f8",
      "--color-border":     "#e2e6f0",
      "--color-border-2":   "#d0d5e8",
      "--color-text":       "#0f1117",
      "--color-text-muted": "#5a6278",
      "--color-text-faint": "#8490a8",
    },
  },
  {
    key: "midnight",
    label: "Midnight",
    icon: "🔵",
    description: "Deep blue tones",
    vars: {
      "--color-bg":         "#060b18",
      "--color-surface":    "#0c1526",
      "--color-surface-2":  "#111d33",
      "--color-border":     "#162035",
      "--color-border-2":   "#1e2e4a",
      "--color-text":       "#d6e4ff",
      "--color-text-muted": "#7a96c2",
      "--color-text-faint": "#4d6a96",
    },
  },
  {
    key: "forest",
    label: "Forest",
    icon: "🌿",
    description: "Nature-inspired greens",
    vars: {
      "--color-bg":         "#080f0a",
      "--color-surface":    "#0d160f",
      "--color-surface-2":  "#121e15",
      "--color-border":     "#172019",
      "--color-border-2":   "#1f2e22",
      "--color-text":       "#d4edd8",
      "--color-text-muted": "#7aaa82",
      "--color-text-faint": "#4d7a55",
    },
  },
];

const STORAGE_KEY = "fd_theme";
const DEFAULT_THEME = "dark";

// ─── Apply CSS vars to :root ──────────────────────────────────────────────────
function applyTheme(themeKey) {
  const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", themeKey);
}

// ─── Preview Swatch ───────────────────────────────────────────────────────────
function ThemeSwatch({ theme, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const bg = theme.vars["--color-bg"];
  const surface = theme.vars["--color-surface"];
  const border = theme.vars["--color-border-2"];
  const primary = "#4f46e5";

  return (
    <button
      onClick={() => onClick(theme.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={theme.label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: "10px 8px",
        borderRadius: 10,
        border: active
          ? "2px solid #4f46e5"
          : hovered
          ? "2px solid #2d2d3f"
          : "2px solid transparent",
        background: active
          ? "rgba(79,70,229,0.1)"
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "none",
        cursor: "pointer",
        transition: "all 0.18s",
        flexShrink: 0,
        minWidth: 64,
      }}
    >
      {/* Mini preview */}
      <div
        style={{
          width: 44,
          height: 32,
          borderRadius: 6,
          background: bg,
          border: `1px solid ${border}`,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Fake sidebar strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: surface,
            borderRight: `1px solid ${border}`,
          }}
        />
        {/* Fake topbar */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            right: 0,
            height: 7,
            background: surface,
            borderBottom: `1px solid ${border}`,
          }}
        />
        {/* Fake content lines */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 11,
            right: 3,
            height: 3,
            borderRadius: 2,
            background: primary,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 17,
            right: 8,
            height: 2,
            borderRadius: 2,
            background: border,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 22,
            right: 12,
            height: 2,
            borderRadius: 2,
            background: border,
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: active ? 700 : 500,
          color: active ? "#818cf8" : "#8b949e",
          whiteSpace: "nowrap",
        }}
      >
        {theme.icon} {theme.label}
      </span>

      {/* Active checkmark */}
      {active && (
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

// ─── Dropdown panel ───────────────────────────────────────────────────────────
function ThemePanel({ currentTheme, onSelect, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const keyHandler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 300,
        background: "#1a1a2e",
        border: "1px solid #2d2d3f",
        borderRadius: 12,
        zIndex: 900,
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        overflow: "hidden",
        animation: "ttDropIn 0.18s ease both",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>
            Appearance
          </div>
          <div style={{ fontSize: 11, color: "#6e7681", marginTop: 1 }}>
            Choose your preferred theme
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6e7681",
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9d1d9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
        >
          ×
        </button>
      </div>

      {/* Swatches grid */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "14px 10px",
          borderBottom: "1px solid #1e1e2e",
        }}
      >
        {THEMES.map((theme) => (
          <ThemeSwatch
            key={theme.key}
            theme={theme}
            active={currentTheme === theme.key}
            onClick={(key) => { onSelect(key); }}
          />
        ))}
      </div>

      {/* Current theme description */}
      <div style={{ padding: "10px 14px" }}>
        {THEMES.map((t) =>
          t.key === currentTheme ? (
            <div
              key={t.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#6e7681",
              }}
            >
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              <span>
                <strong style={{ color: "#818cf8" }}>{t.label}</strong>
                {" — "}
                {t.description}
              </span>
            </div>
          ) : null
        )}
      </div>

      {/* System preference toggle */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #1e1e2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#6e7681",
        }}
      >
        <span>Sync with system</span>
        <SystemSyncToggle onSync={onSelect} />
      </div>
    </div>
  );
}

// ─── System preference sync ───────────────────────────────────────────────────
function SystemSyncToggle({ onSync }) {
  const [syncing, setSyncing] = useState(false);

  function toggle() {
    if (syncing) {
      setSyncing(false);
      return;
    }
    setSyncing(true);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    onSync(prefersDark ? "dark" : "light");

    // Live listener
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => onSync(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);

    // Store cleanup fn reference
    window.__fdThemeMQCleanup = () => mq.removeEventListener("change", handler);
  }

  useEffect(() => {
    if (!syncing && window.__fdThemeMQCleanup) {
      window.__fdThemeMQCleanup();
      delete window.__fdThemeMQCleanup;
    }
  }, [syncing]);

  return (
    <button
      onClick={toggle}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        background: syncing ? "#4f46e5" : "#2d2d3f",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: syncing ? 19 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s",
          display: "block",
        }}
      />
    </button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef();

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function handleSelect(key) {
    setTheme(key);
    applyTheme(key);
    localStorage.setItem(STORAGE_KEY, key);
  }

  // Quick toggle between dark / light (compact mode)
  function handleQuickToggle() {
    const next = theme === "light" ? "dark" : "light";
    handleSelect(next);
  }

  const current = THEMES.find((t) => t.key === theme) || THEMES[0];

  // ── Compact: single icon button ──
  if (compact) {
    return (
      <div ref={wrapperRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          title="Change theme"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: `1px solid ${open ? "#4f46e5" : hovered ? "#2d2d3f" : "#1e1e2e"}`,
            background: open
              ? "rgba(79,70,229,0.1)"
              : hovered
              ? "rgba(255,255,255,0.05)"
              : "none",
            cursor: "pointer",
            fontSize: 16,
            transition: "all 0.15s",
            color: "#8b949e",
            flexShrink: 0,
          }}
        >
          {current.icon}
        </button>

        {open && (
          <ThemePanel
            currentTheme={theme}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
          />
        )}

        <style>{`
          @keyframes ttDropIn {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
        `}</style>
      </div>
    );
  }

  // ── Full: label button + dropdown ──
  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid ${open ? "#4f46e5" : hovered ? "#2d2d3f" : "#1e1e2e"}`,
          background: open
            ? "rgba(79,70,229,0.1)"
            : hovered
            ? "rgba(255,255,255,0.04)"
            : "none",
          color: open ? "#818cf8" : "#8b949e",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.18s",
        }}
      >
        <span style={{ fontSize: 15 }}>{current.icon}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ThemePanel
          currentTheme={theme}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}

      <style>{`
        @keyframes ttDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}