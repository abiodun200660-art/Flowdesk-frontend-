// flowdesk-frontend/components/tasks/TaskTimer.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function formatDurationLabel(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || !parts.length) parts.push(`${s}s`);
  return parts.join(" ");
}

function timeLabel(isoStr) {
  return new Date(isoStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function dateDiff(start, end) {
  return Math.floor((new Date(end) - new Date(start)) / 1000);
}

// ─── Session Log Row ──────────────────────────────────────────────────────────
function SessionRow({ session, onDelete }) {
  const duration = dateDiff(session.startedAt, session.endedAt);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 10px", borderRadius: 8,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #1e1e2e",
        fontSize: 12,
      }}
    >
      <span style={{ fontSize: 16 }}>⏱</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#c9d1d9", fontWeight: 600 }}>{formatDurationLabel(duration)}</div>
        <div style={{ color: "#6e7681", fontSize: 11 }}>
          {timeLabel(session.startedAt)} → {timeLabel(session.endedAt)}
          {session.note && <span style={{ marginLeft: 8, color: "#818cf8" }}>"{session.note}"</span>}
        </div>
      </div>
      <button
        onClick={() => onDelete(session.id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#6e7681", fontSize: 13, padding: "2px 4px",
          borderRadius: 4, transition: "all 0.15s",
        }}
        title="Delete session"
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6e7681")}
      >🗑</button>
    </div>
  );
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function Ring({ progress, size = 120, stroke = 8, color = "#4f46e5", children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Manual Entry Form ────────────────────────────────────────────────────────
function ManualEntryForm({ onAdd, onClose }) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function handleAdd() {
    const totalSeconds = (+hours || 0) * 3600 + (+minutes || 0) * 60;
    if (totalSeconds <= 0) return;
    const endedAt = new Date(`${date}T12:00:00`).toISOString();
    const startedAt = new Date(new Date(endedAt) - totalSeconds * 1000).toISOString();
    onAdd({ id: Date.now(), startedAt, endedAt, manual: true, note });
    onClose();
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "6px 8px",
    background: "#161622", border: "1px solid #2d2d3f",
    borderRadius: 6, color: "#e6edf3", fontSize: 12,
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "12px 0", borderTop: "1px solid #1e1e2e", marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e", marginBottom: 10 }}>Manual Time Entry</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#6e7681" }}>Hours</label>
          <input type="number" min={0} max={24} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#6e7681" }}>Minutes</label>
          <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#6e7681" }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")} />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 11, color: "#6e7681" }}>Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you work on?" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={handleAdd}
          disabled={!(+hours || +minutes)}
          style={{
            flex: 1, padding: "6px 0", borderRadius: 6, border: "none",
            background: (+hours || +minutes) ? "#4f46e5" : "#2d2d3f",
            color: "#fff", fontSize: 12, fontWeight: 600,
            cursor: (+hours || +minutes) ? "pointer" : "not-allowed",
          }}
        >Add Entry</button>
        <button onClick={onClose} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #2d2d3f", background: "none", color: "#8b949e", fontSize: 12, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
  {
    id: 1,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    endedAt: new Date(Date.now() - 5400000).toISOString(),
    note: "Initial setup",
  },
  {
    id: 2,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    endedAt: new Date(Date.now() - 2700000).toISOString(),
    note: "Bug fix",
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskTimer({
  taskId,
  estimatedSeconds = 3600 * 2,
  sessions: initialSessions = MOCK_SESSIONS,
  onSessionsChange,
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [note, setNote] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [activeEntryId, setActiveEntryId] = useState(null); // tracks backend TimeEntry _id
  const intervalRef = useRef();

  // Total logged time from all sessions
  const totalLogged = sessions.reduce((acc, s) => acc + dateDiff(s.startedAt, s.endedAt), 0);
  const grandTotal = totalLogged + elapsed;
  const progress = estimatedSeconds > 0 ? Math.min((grandTotal / estimatedSeconds) * 100, 100) : 0;
  const isOverEstimate = grandTotal > estimatedSeconds && estimatedSeconds > 0;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Warn when switching tabs while running
  useEffect(() => {
    const handler = (e) => {
      if (running) { e.preventDefault(); e.returnValue = "Timer is running. Are you sure you want to leave?"; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [running]);

  async function startTimer() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setElapsed(0);
    setRunning(true);
    // Persist start to backend — POST /api/time-entries/start
    try {
      const { data } = await api.post("/api/time-entries/start", { taskId });
      setActiveEntryId(data.timeEntry._id);
    } catch (err) {
      console.error("[TaskTimer] Failed to start time entry:", err);
      // Timer still runs locally even if backend call fails
    }
  }

  async function stopTimer() {
    setRunning(false);
    const endedAt = new Date().toISOString();
    const session = { id: Date.now(), startedAt, endedAt, note: note.trim() };
    const next = [...sessions, session];
    setSessions(next);
    onSessionsChange?.(next);
    setNote("");
    setElapsed(0);
    setStartedAt(null);
    // Persist stop to backend — PUT /api/time-entries/:id/stop
    if (activeEntryId) {
      try {
        await api.put(`/api/time-entries/${activeEntryId}/stop`);
      } catch (err) {
        console.error("[TaskTimer] Failed to stop time entry:", err);
      }
      setActiveEntryId(null);
    }
  }

  function deleteSession(id) {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    onSessionsChange?.(next);
  }

  function addManualSession(session) {
    const next = [...sessions, session];
    setSessions(next);
    onSessionsChange?.(next);
  }

  const ringColor = isOverEstimate ? "#ef4444" : progress > 75 ? "#f59e0b" : "#4f46e5";

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        background: "#0d0d1a",
        color: "#e6edf3",
        borderRadius: 14,
        border: "1px solid #1e1e2e",
        padding: 20,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>⏱ Time Tracker</div>
          <div style={{ fontSize: 11, color: "#6e7681", marginTop: 2 }}>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
          </div>
        </div>
        <div
          style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
            background: running ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
            color: running ? "#22c55e" : "#6e7681",
            border: `1px solid ${running ? "#22c55e44" : "#2d2d3f"}`,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: running ? "#22c55e" : "#6e7681", animation: running ? "pulse 1.2s infinite" : "none" }} />
          {running ? "Running" : "Stopped"}
        </div>
      </div>

      {/* Ring + Timer */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <Ring progress={progress} size={140} stroke={10} color={ringColor}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: running ? 22 : 20, fontWeight: 800,
                color: running ? ringColor : "#e6edf3",
                fontVariantNumeric: "tabular-nums",
                transition: "color 0.3s",
              }}
            >
              {running ? formatDuration(elapsed) : formatDuration(grandTotal)}
            </div>
            <div style={{ fontSize: 10, color: "#6e7681" }}>
              {running ? "Current" : "Total"}
            </div>
          </div>
        </Ring>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Logged", value: formatDurationLabel(totalLogged), color: "#818cf8" },
          { label: "Estimate", value: estimatedSeconds ? formatDurationLabel(estimatedSeconds) : "—", color: "#6e7681" },
          {
            label: isOverEstimate ? "Over by" : "Remaining",
            value: estimatedSeconds ? formatDurationLabel(Math.abs(estimatedSeconds - grandTotal)) : "—",
            color: isOverEstimate ? "#ef4444" : "#22c55e",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1, textAlign: "center", padding: "8px 0",
              background: "rgba(255,255,255,0.03)", borderRadius: 8,
              border: "1px solid #1e1e2e",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: "#6e7681", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Note input when running */}
      {running && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What are you working on? (optional)"
          style={{
            width: "100%", boxSizing: "border-box", padding: "7px 10px",
            background: "#161622", border: "1px solid #2d2d3f",
            borderRadius: 8, color: "#e6edf3", fontSize: 12,
            outline: "none", fontFamily: "inherit", marginBottom: 12,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
          onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
        />
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {!running ? (
          <>
            <button
              onClick={startTimer}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(79,70,229,0.4)", transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              ▶ Start Timer
            </button>
            <button
              onClick={() => setShowManual((v) => !v)}
              style={{
                padding: "10px 14px", borderRadius: 8,
                border: "1px solid #2d2d3f", background: "none",
                color: "#8b949e", fontSize: 12, cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Add manual entry"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#8b949e"; }}
            >
              ✏️ Manual
            </button>
          </>
        ) : (
          <button
            onClick={stopTimer}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(220,38,38,0.35)", transition: "opacity 0.15s",
              animation: "subtlePulse 2s infinite",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ■ Stop & Save
          </button>
        )}
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <ManualEntryForm onAdd={addManualSession} onClose={() => setShowManual(false)} />
      )}

      {/* Progress bar */}
      {estimatedSeconds > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6e7681", marginBottom: 4 }}>
            <span>Progress vs estimate</span>
            <span style={{ color: isOverEstimate ? "#ef4444" : "#c9d1d9" }}>
              {Math.round(progress)}%{isOverEstimate ? " ⚠ Over" : ""}
            </span>
          </div>
          <div style={{ height: 6, background: "#1e1e2e", borderRadius: 3 }}>
            <div
              style={{
                height: "100%", width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${ringColor}, ${ringColor}bb)`,
                borderRadius: 3, transition: "width 0.5s",
              }}
            />
          </div>
        </div>
      )}

      {/* Session Log */}
      <div>
        <button
          onClick={() => setShowLog((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", color: "#8b949e", fontSize: 12,
            fontWeight: 600, padding: "0 0 8px", width: "100%", textAlign: "left",
          }}
        >
          <span>{showLog ? "▾" : "▸"}</span>
          <span>Session Log ({sessions.length})</span>
        </button>

        {showLog && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", color: "#6e7681", fontSize: 12, padding: "12px 0" }}>
                No sessions yet. Start the timer to log time.
              </div>
            ) : (
              [...sessions].reverse().map((s) => (
                <SessionRow key={s.id} session={s} onDelete={deleteSession} />
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes subtlePulse { 0%,100%{box-shadow:0 4px 16px rgba(220,38,38,0.35)} 50%{box-shadow:0 4px 24px rgba(220,38,38,0.6)} }
      `}</style>
    </div>
  );
}