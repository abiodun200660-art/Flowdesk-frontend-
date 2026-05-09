'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",            icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/tasks",      icon: "✅", label: "Tasks" },
  { href: "/dashboard/projects",   icon: "📁", label: "Projects" },
  { href: "/dashboard/team",       icon: "👥", label: "Team" },
  { href: "/dashboard/time",       icon: "⏱",  label: "Timesheet" },
  { href: "/dashboard/analytics",  icon: "📊", label: "Analytics" },
  { href: "/dashboard/settings",   icon: "⚙️", label: "Settings" },
];

function NavItem({ item, active, collapsed }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.15s",
        background: active
          ? "rgba(79,70,229,0.18)"
          : hovered
          ? "rgba(255,255,255,0.05)"
          : "none",
        color: active ? "#818cf8" : hovered ? "#c9d1d9" : "#8b949e",
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        outline: active ? "1px solid rgba(79,70,229,0.25)" : "none",
        marginBottom: 2,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
      {active && !collapsed && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4f46e5",
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  );
}

export default function Sidebar({ collapsed, onToggle, currentUser }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("fd_token");
    router.push("/login");
  }

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#13131f",
        borderRight: "1px solid #1e1e2e",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "14px 0" : "14px 16px",
          borderBottom: "1px solid #1e1e2e",
          height: 56,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ⚡
          </button>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
                }}
              >
                ⚡
              </div>
              <span
                style={{ fontSize: 15, fontWeight: 800, color: "#e6edf3", letterSpacing: -0.3 }}
              >
                FlowDesk
              </span>
            </div>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6e7681",
                fontSize: 13,
                padding: 4,
                borderRadius: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9d1d9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
            >
              ◀
            </button>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "12px 8px" : "12px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px",
          borderTop: "1px solid #1e1e2e",
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
              }}
              title={currentUser?.name}
            >
              {initials}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
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
                {currentUser?.name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "#6e7681" }}>
                {currentUser?.role || "Member"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6e7681",
                fontSize: 15,
                padding: 4,
                borderRadius: 4,
                transition: "color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
            >
              ⏻
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}