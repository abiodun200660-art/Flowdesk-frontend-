'use client'

export default function Spinner({
  size = 24,
  color = "#4f46e5",
  trackColor = "#1e1e2e",
  thickness = 3,
  label = "Loading…",
  center = false,
}) {
  const spinner = (
    <>
      <div
        role="status"
        aria-label={label}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: ${thickness}px solid ${trackColor},
          borderTopColor: color,
          animation: "spin 0.75s linear infinite",
          flexShrink: 0,
        }}
      />
      <style>{@keyframes spin { to { transform: rotate(360deg); } }}</style>
    </>
  );

  if (center) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: 40,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
export function PageSpinner({ message = "Loading…" }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d1a",
        gap: 14,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <Spinner size={40} thickness={4} />
      <div style={{ fontSize: 13, color: "#6e7681" }}>{message}</div>
    </div>
  );
}
