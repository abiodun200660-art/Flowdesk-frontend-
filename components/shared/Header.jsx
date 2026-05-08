// flowdesk-frontend/components/shared/Header.jsx

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";

// ─── Search Result Item ───────────────────────────────────────────────────────
function SearchResult({ result, onClick }) {
  const [hovered, setHovered] = useState(false);

  const typeColors = {
    task:    { color: "#818cf8", bg: "rgba(79,70,229,0.12)",  icon: "✅" },
    project: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: "📁" },
    member:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "👤" },
    page:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "📄" },
  };

  const meta = typeColors[result.type] || typeColors.page;

  return (
    <div
      onClick={() => onClick(result)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
        background: hovered ? "rgba(255,255,255,0.05)" : "none",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {result.icon || meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e6edf3",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {result.label}
        </div>
        {result.sublabel && (
          <div
            style={{
              fontSize: 11,
              color: "#6e7681",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {result.sublabel}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 20,
          background: meta.bg,
          color: meta.color,
          flexShrink: 0,
          textTransform: "capitalize",
        }}
      >
        {result.type}
      </span>
    </div>
  );
}

// ─── Search Dropdown ──────────────────────────────────────────────────────────
function SearchDropdown({ query, results, loading, onSelect, onClose }) {
  const grouped = results.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        right: 0,
        background: "#1a1a2e",
        border: "1px solid #2d2d3f",
        borderRadius: 10,
        zIndex: 800,
        boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
        overflow: "hidden",
        animation: "dropIn 0.15s ease both",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "20px 16px",
            color: "#6e7681",
            fontSize: 13,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid #2d2d3f",
              borderTopColor: "#4f46e5",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Searching…
        </div>
      ) : results.length === 0 ? (
        <div
          style={{
            padding: "20px 16px",
            textAlign: "center",
            color: "#6e7681",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
          No results for <strong style={{ color: "#c9d1d9" }}>"{query}"</strong>
        </div>
      ) : (
        <div style={{ padding: 6, maxHeight: 380, overflowY: "auto" }}>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#6e7681",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  padding: "8px 12px 4px",
                }}
              >
                {type}s
              </div>
              {items.map((r) => (
                <SearchResult key={r.id} result={r} onClick={(res) => { onSelect(res); onClose(); }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions footer */}
      <div
        style={{
          borderTop: "1px solid #1e1e2e",
          padding: "8px 12px",
          display: "flex",
          gap: 12,
          fontSize: 11,
          color: "#6e7681",
        }}
      >
        <span><kbd style={kbdStyle}>↑↓</kbd> Navigate</span>
        <span><kbd style={kbdStyle}>↵</kbd> Open</span>
        <span><kbd style={kbdStyle}>Esc</kbd> Close</span>
      </div>
    </div>
  );
}

const kbdStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid #2d2d3f",
  borderRadius: 4,
  padding: "1px 5px",
  fontSize: 10,
  fontFamily: "monospace",
  color: "#c9d1d9",
};

// ─── Mock search data ─────────────────────────────────────────────────────────
const MOCK_SEARCH_DATA = [
  { id: 1,  type: "task",    label: "Redesign onboarding flow",      sublabel: "In Progress · Due May 8",       href: "/dashboard/tasks" },
  { id: 2,  type: "task",    label: "Fix auth token expiry bug",      sublabel: "Todo · Critical",               href: "/dashboard/tasks" },
  { id: 3,  type: "task",    label: "Write API documentation",        sublabel: "In Progress · Due May 10",      href: "/dashboard/tasks" },
  { id: 4,  type: "project", label: "FlowDesk App",                  sublabel: "8 active tasks",                href: "/dashboard/projects" },
  { id: 5,  type: "project", label: "Marketing Site",                sublabel: "3 active tasks",                href: "/dashboard/projects" },
  { id: 6,  type: "member",  label: "Alice Johnson",                 sublabel: "Admin · alice@flowdesk.io",     href: "/dashboard/team" },
  { id: 7,  type: "member",  label: "Bob Smith",                     sublabel: "Developer · bob@flowdesk.io",   href: "/dashboard/team" },
  { id: 8,  type: "page",    label: "Analytics",                     sublabel: "View team performance",         href: "/dashboard/analytics" },
  { id: 9,  type: "page",    label: "Timesheet",                     sublabel: "Log and review time",           href: "/dashboard/time" },
  { id: 10, type: "task",    label: "Mobile responsive fixes",        sublabel: "In Review · Due May 9",        href: "/dashboard/tasks" },
];

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef();
  const wrapperRef = useRef();
  const debounceRef = useRef();
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Global shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const runSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filtered = MOCK_SEARCH_DATA.filter(
        (d) =>
          d.label.toLowerCase().includes(q.toLowerCase()) ||
          d.sublabel?.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 280);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    runSearch(val);
  }

  function handleSelect(result) {
    if (result.href) router.push(result.href);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapperRef} style={{ flex: 1, maxWidth: 380, position: "relative" }}>
      {/* Input */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 13,
            color: "#6e7681",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => { setOpen(true); if (query) runSearch(query); }}
          placeholder="Search…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 70px 6px 30px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${open ? "#4f46e5" : "#2d2d3f"}`,
            borderRadius: 8,
            color: "#e6edf3",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
        />
        {/* Right side: clear button + shortcut hint */}
        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {query ? (
            <button
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6e7681",
                fontSize: 16,
                lineHeight: 1,
                padding: "0 2px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9d1d9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
            >
              ×
            </button>
          ) : (
            <kbd
              style={{
                ...kbdStyle,
                fontSize: 10,
                padding: "2px 5px",
                opacity: 0.6,
                pointerEvents: "none",
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && query.trim() && (
        <SearchDropdown
          query={query}
          results={results}
          loading={loading}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
  "/dashboard/tasks":     "Tasks",
  "/dashboard/projects":  "Projects",
  "/dashboard/team":      "Team",
  "/dashboard/time":      "Timesheet",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings":  "Settings",
  "/dashboard":           "Dashboard",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Header({ title: propTitle, currentUser }) {
  const [pathname, setPathname] = useState("/dashboard");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const derivedTitle =
    propTitle ||
    Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ||
    "FlowDesk";

  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        borderBottom: "1px solid #1e1e2e",
        background: "#0d0d1a",
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page title */}
      <h1
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "#e6edf3",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {derivedTitle}
      </h1>

      {/* Search */}
      <SearchBar />

      {/* Right actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        <WorkspaceSwitcher />
        <ThemeToggle compact />
        <NotificationBell />
        <UserMenu currentUser={currentUser} />
      </div>

      <style>{`
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </header>
  );
}
