// flowdesk-frontend/components/auth/GoogleButton.jsx

"use client";

import { useState } from "react";

// ─── Google SVG Logo ──────────────────────────────────────────────────────────
function GoogleLogo({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.2)",
        borderTopColor: "#fff",
        animation: "gbSpin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function OAuthDivider({ label = "or continue with email" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "4px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
      <span
        style={{
          fontSize: 11,
          color: "#6e7681",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
    </div>
  );
}

// ─── GitHub Button (bonus — same pattern) ────────────────────────────────────
function GitHubLogo({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function GitHubButton({ onClick, loading = false, disabled = false, label = "Continue with GitHub" }) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isDisabled}
      type="button"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 9,
        border: `1px solid ${hovered && !isDisabled ? "#4f46e5" : "#2d2d3f"}`,
        background: hovered && !isDisabled
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.04)",
        color: isDisabled ? "#6e7681" : "#c9d1d9",
        fontSize: 14,
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.18s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {loading ? <Spinner /> : <GitHubLogo size={18} />}
      <span>{loading ? "Connecting…" : label}</span>
      <style>{`@keyframes gbSpin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

// ─── MAIN COMPONENT — Google Button ──────────────────────────────────────────
export default function GoogleButton({
  onClick,
  loading = false,
  disabled = false,
  label = "Continue with Google",
  variant = "default", // "default" | "icon" | "minimal"
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  // ── Icon-only variant ──
  if (variant === "icon") {
    return (
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        type="button"
        title={label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          border: `1px solid ${hovered && !isDisabled ? "#4f46e5" : "#2d2d3f"}`,
          background: hovered && !isDisabled
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.04)",
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.18s",
          flexShrink: 0,
        }}
      >
        {loading ? <Spinner size={16} /> : <GoogleLogo size={18} />}
        <style>{`@keyframes gbSpin { to { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }

  // ── Minimal text-link variant ──
  if (variant === "minimal") {
    return (
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          color: hovered && !isDisabled ? "#818cf8" : "#6e7681",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "inherit",
          padding: "2px 0",
          transition: "color 0.15s",
          textDecoration: hovered && !isDisabled ? "underline" : "none",
        }}
      >
        {loading ? <Spinner size={13} /> : <GoogleLogo size={14} />}
        <span>{loading ? "Connecting…" : label}</span>
        <style>{`@keyframes gbSpin { to { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }

  // ── Default full-width variant ──
  return (
    <>
      <button
        onClick={isDisabled ? undefined : onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        disabled={isDisabled}
        type="button"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 9,
          border: `1px solid ${
            isDisabled
              ? "#1e1e2e"
              : hovered
              ? "#4f46e5"
              : "#2d2d3f"
          }`,
          background: isDisabled
            ? "rgba(255,255,255,0.02)"
            : pressed
            ? "rgba(255,255,255,0.04)"
            : hovered
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.04)",
          color: isDisabled ? "#6e7681" : "#c9d1d9",
          fontSize: 14,
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "all 0.18s",
          transform: pressed && !isDisabled ? "scale(0.99)" : "scale(1)",
          boxShadow:
            hovered && !isDisabled
              ? "0 4px 16px rgba(79,70,229,0.15)"
              : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer on hover */}
        {hovered && !isDisabled && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
              animation: "gbShimmer 1.2s ease infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {loading ? <Spinner size={18} /> : <GoogleLogo size={18} />}

        <span style={{ position: "relative", zIndex: 1 }}>
          {loading ? "Connecting to Google…" : label}
        </span>
      </button>

      <style>{`
        @keyframes gbSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes gbShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }
      `}</style>
    </>
  );
}
