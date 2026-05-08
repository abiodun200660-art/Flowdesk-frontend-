// flowdesk-frontend/components/shared/OfflineIndicator.jsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PING_URL = "/favicon.ico";
const PING_INTERVAL = 15_000;   // check every 15s while offline
const RECONNECT_TOAST_DURATION = 4_000;
const QUEUE_KEY = "fd_offline_queue";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Animated dots (shown while offline) ─────────────────────────────────────
function PulseDot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        animation: "offlinePulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

// ─── Single toast bubble ──────────────────────────────────────────────────────
function Toast({
  icon,
  color,
  bg,
  border,
  children,
  onDismiss,
  actions,
  persistent = false,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 13,
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: 420,
        width: "calc(100vw - 48px)",
        animation: "offlineSlideUp 0.25s ease both",
        pointerEvents: "all",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>

      {/* Action buttons */}
      {actions && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${color}55`,
                background: `${color}18`,
                color,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Dismiss */}
      {!persistent && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color,
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
            opacity: 0.55,
            flexShrink: 0,
            transition: "opacity 0.15s",
            marginTop: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── Offline detail panel ─────────────────────────────────────────────────────
function OfflineDetail({ offlineSince, queueCount, onRetry, retrying }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - offlineSince);
    }, 1000);
    return () => clearInterval(interval);
  }, [offlineSince]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Main message */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PulseDot color="#f87171" />
        <span style={{ fontWeight: 600, color: "#f87171" }}>
          You're offline
        </span>
        <span style={{ fontSize: 11, color: "#ef444488", marginLeft: 2 }}>
          ({formatTime(elapsed)} ago)
        </span>
      </div>

      {/* Queue count */}
      <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>
        {queueCount > 0 ? (
          <>
            <strong>{queueCount}</strong> change
            {queueCount !== 1 ? "s" : ""} queued — will sync automatically when
            you reconnect.
          </>
        ) : (
          "Changes will sync automatically when you reconnect."
        )}
      </div>

      {/* Retry */}
      <button
        onClick={onRetry}
        disabled={retrying}
        style={{
          alignSelf: "flex-start",
          marginTop: 2,
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #ef444455",
          background: retrying ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.12)",
          color: "#f87171",
          fontSize: 11,
          fontWeight: 700,
          cursor: retrying ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "opacity 0.15s",
        }}
      >
        {retrying ? (
          <>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "1.5px solid #f8717133",
                borderTopColor: "#f87171",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }}
            />
            Checking…
          </>
        ) : (
          <>🔄 Retry connection</>
        )}
      </button>
    </div>
  );
}

// ─── Reconnected detail ───────────────────────────────────────────────────────
function ReconnectedDetail({ syncedCount }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontWeight: 600, color: "#22c55e" }}>Back online!</div>
      <div style={{ fontSize: 12, color: "#86efac", lineHeight: 1.5 }}>
        {syncedCount > 0
          ? `${syncedCount} queued change${syncedCount !== 1 ? "s" : ""} synced successfully.`
          : "Your connection has been restored."}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OfflineIndicator() {
  const [online, setOnline]           = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showOnline, setShowOnline]   = useState(false);
  const [offlineSince, setOfflineSince] = useState(null);
  const [queueCount, setQueueCount]   = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [retrying, setRetrying]       = useState(false);
  const [dismissed, setDismissed]     = useState(false);
  const pingRef  = useRef();
  const timerRef = useRef();

  // ── Sync queue count from localStorage ──
  const refreshQueue = useCallback(() => {
    setQueueCount(getQueue().length);
  }, []);

  // ── Active ping to verify real connectivity ──
  const pingServer = useCallback(async () => {
    try {
      const res = await fetch(`${PING_URL}?_=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }, []);

  // ── Go offline ──
  const handleOffline = useCallback(() => {
    setOnline(false);
    setShowOffline(true);
    setShowOnline(false);
    setDismissed(false);
    setOfflineSince(Date.now());
    refreshQueue();

    // Poll until back online
    pingRef.current = setInterval(async () => {
      const alive = await pingServer();
      if (alive) handleOnlineRestored();
    }, PING_INTERVAL);
  }, [pingServer, refreshQueue]);

  // ── Go online ──
  const handleOnlineRestored = useCallback(() => {
    clearInterval(pingRef.current);
    const q = getQueue();
    setSyncedCount(q.length);
    setOnline(true);
    setShowOffline(false);
    setShowOnline(true);
    setDismissed(false);

    // Auto-hide the "back online" toast
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowOnline(false);
    }, RECONNECT_TOAST_DURATION);
  }, []);

  useEffect(() => {
    // Initialise from browser state
    if (!navigator.onLine) handleOffline();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnlineRestored);

    // Keep queue count in sync with storage events (other tabs)
    window.addEventListener("storage", refreshQueue);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnlineRestored);
      window.removeEventListener("storage", refreshQueue);
      clearInterval(pingRef.current);
      clearTimeout(timerRef.current);
    };
  }, [handleOffline, handleOnlineRestored, refreshQueue]);

  // ── Manual retry ──
  async function handleRetry() {
    setRetrying(true);
    const alive = await pingServer();
    if (alive) {
      handleOnlineRestored();
    } else {
      setRetrying(false);
    }
  }

  // Nothing to show
  if ((!showOffline && !showOnline) || (showOffline && dismissed)) return null;

  return (
    <>
      {/* Fixed container bottom-centre */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {/* ── OFFLINE toast ── */}
        {showOffline && !dismissed && (
          <Toast
            icon="⚠️"
            color="#f87171"
            bg="rgba(17,10,10,0.95)"
            border="#ef444444"
            onDismiss={() => setDismissed(true)}
            persistent={false}
          >
            <OfflineDetail
              offlineSince={offlineSince}
              queueCount={queueCount}
              onRetry={handleRetry}
              retrying={retrying}
            />
          </Toast>
        )}

        {/* ── BACK ONLINE toast ── */}
        {showOnline && (
          <Toast
            icon="✅"
            color="#22c55e"
            bg="rgba(10,17,10,0.95)"
            border="#22c55e44"
            onDismiss={() => setShowOnline(false)}
          >
            <ReconnectedDetail syncedCount={syncedCount} />
          </Toast>
        )}
      </div>

      {/* ── Slim top bar shown while offline (persistent) ── */}
      {showOffline && !dismissed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 12px, transparent 12px, transparent 20px)",
            backgroundSize: "20px 3px",
            animation: "offlineStripe 0.8s linear infinite",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}

      <style>{`
        @keyframes offlineSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes offlinePulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes offlineStripe {
          from { background-position: 0 0;   }
          to   { background-position: 20px 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}