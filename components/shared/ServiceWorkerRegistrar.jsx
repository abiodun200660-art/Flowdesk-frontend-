// flowdesk-frontend/components/shared/ServiceWorkerRegistrar.jsx

"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistrar() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let registration = null;

    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (registration.active && !navigator.serviceWorker.controller) {
          setOfflineReady(true);
          setTimeout(() => setOfflineReady(false), 4000);
        }

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateAvailable(true);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }

            if (newWorker.state === "activated" && !navigator.serviceWorker.controller) {
              setOfflineReady(true);
              setTimeout(() => setOfflineReady(false), 4000);
            }
          });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        const interval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60_000);

        return () => clearInterval(interval);
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    }

    register();

    return () => {};
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setUpdateAvailable(false);
    setWaitingWorker(null);
  }

  function dismissUpdate() {
    setUpdateAvailable(false);
    setDismissed(true);
  }

  if (offlineReady) {
    return (
      <Toast
        icon="✅"
        color="#22c55e"
        bg="rgba(34,197,94,0.12)"
        border="#22c55e44"
        message="App ready — works offline"
        onDismiss={() => setOfflineReady(false)}
      />
    );
  }

  if (updateAvailable && !dismissed) {
    return (
      <Toast
        icon="🔄"
        color="#818cf8"
        bg="rgba(79,70,229,0.12)"
        border="#4f46e544"
        message="A new version of FlowDesk is available"
        action={{ label: "Update now", onClick: applyUpdate }}
        onDismiss={dismissUpdate}
      />
    );
  }

  return null;
}

function Toast({ icon, color, bg, border, message, action, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        whiteSpace: "nowrap",
        animation: "swToastIn 0.25s ease both",
        maxWidth: "calc(100vw - 48px)",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>

      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
        {message}
      </span>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${color}66`,
            background: `${color}18`,
            color,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {action.label}
        </button>
      )}

      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color,
          fontSize: 16,
          lineHeight: 1,
          padding: "0 2px",
          opacity: 0.7,
          flexShrink: 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        title="Dismiss"
      >
        ×
      </button>

      <style>{`
        @keyframes swToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}