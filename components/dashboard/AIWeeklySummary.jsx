// flowdesk-frontend/components/dashboard/AIWeeklySummary.jsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const REFRESH_COOLDOWN_MS = 60_000; // 1 minute between manual refreshes
const TYPING_SPEED_MS     = 18;     // ms per character for typewriter effect

// ─── Mock weekly stats (replace with api.get("/analytics/weekly-summary")) ───
const MOCK_STATS = {
  tasksCompleted:   24,
  tasksCreated:     31,
  hoursLogged:      142,
  avgCompletionDays: 2.4,
  topContributor:   "Bob Smith",
  overdueTasks:     3,
  blockedTasks:     2,
  teamMoodScore:    78,   // 0–100
  velocityChange:   +12,  // % vs last week
  focusArea:        "API v2",
};

// ─── Mock AI summary paragraphs ───────────────────────────────────────────────
const MOCK_SUMMARIES = [
  `This week your team completed **24 tasks** — a **+12% improvement** over last week. Bob Smith led the charge with the highest individual output, closing 7 tasks across the API v2 project. The average task completion time held steady at **2.4 days**, which is well within your sprint targets.

Three tasks are currently **overdue** and two are **blocked**, primarily in the onboarding redesign thread. It's worth scheduling a quick sync to unblock Carol White's design review dependency before the end of the sprint.

Overall team velocity is trending upward. If the current pace holds, you're on track to complete **Sprint 22 ahead of schedule** by approximately 1.5 days. Consider pulling in backlog items from the Mobile App project to keep momentum.`,

  `A strong week overall — **142 hours** were logged across all members, with the bulk concentrated on the API v2 milestone. The team maintained a healthy focus ratio: roughly **68% deep work** vs 32% meetings and reviews, which is above industry average for software teams.

The biggest risk heading into next week is the cluster of **3 overdue tasks** around the authentication flow. These share a common dependency on the database schema migration led by David Lee. Unblocking that single item would cascade positively across at least 4 downstream tasks.

On a positive note, Emma Davis ramped up quickly after joining and has already delivered her first component library milestone on time. Team mood indicators suggest **high engagement** this week (78/100).`,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatNumber(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#e6edf3", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderParagraphs(text) {
  return text.split("\n\n").map((para, i) => (
    <p
      key={i}
      style={{
        margin: 0,
        marginBottom: i < text.split("\n\n").length - 1 ? 14 : 0,
        lineHeight: 1.75,
        color: "#8b949e",
        fontSize: 13,
      }}
    >
      {parseBold(para)}
    </p>
  ));
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color, delta }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #1e1e2e",
        borderRadius: 10,
        flex: "1 1 100px",
        minWidth: 90,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 11, color: "#6e7681", fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: color || "#e6edf3",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: delta >= 0 ? "#22c55e" : "#ef4444",
          }}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last week
        </div>
      )}
    </div>
  );
}

// ─── Mood Bar ─────────────────────────────────────────────────────────────────
function MoodBar({ score }) {
  const color =
    score >= 75 ? "#22c55e" :
    score >= 50 ? "#f59e0b" :
                  "#ef4444";
  const label =
    score >= 75 ? "High engagement 🔥" :
    score >= 50 ? "Moderate engagement" :
                  "Low engagement ⚠️";

  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#6e7681",
          marginBottom: 4,
        }}
      >
        <span>Team mood</span>
        <span style={{ color, fontWeight: 600 }}>{label}</span>
      </div>
      <div
        style={{
          height: 5,
          background: "#1e1e2e",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 3,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ label, count, color, bg }) {
  if (!count) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          animation: "aiPulse 1.6s ease-in-out infinite",
        }}
      />
      {count} {label}
    </span>
  );
}

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text, enabled) {
  const [displayed, setDisplayed] = useState("");
  const [done,      setDone]      = useState(false);
  const idxRef = useRef(0);
  const timerRef = useRef();

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    idxRef.current = 0;

    function tick() {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current < text.length) {
        timerRef.current = setTimeout(tick, TYPING_SPEED_MS);
      } else {
        setDone(true);
      }
    }
    timerRef.current = setTimeout(tick, TYPING_SPEED_MS);
    return () => clearTimeout(timerRef.current);
  }, [text, enabled]);

  return { displayed, done };
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy summary"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 6,
        border: "1px solid #2d2d3f",
        background: "none",
        color: copied ? "#22c55e" : "#6e7681",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; } }}
      onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#6e7681"; } }}
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}

// ─── Feedback Buttons ─────────────────────────────────────────────────────────
function FeedbackRow({ onFeedback, feedback }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#6e7681" }}>Was this helpful?</span>
      {[
        { key: "up",   icon: "👍", label: "Yes" },
        { key: "down", icon: "👎", label: "No"  },
      ].map((btn) => (
        <button
          key={btn.key}
          onClick={() => onFeedback(btn.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 6,
            border: `1px solid ${feedback === btn.key ? "#4f46e5" : "#2d2d3f"}`,
            background: feedback === btn.key ? "rgba(79,70,229,0.12)" : "none",
            color: feedback === btn.key ? "#818cf8" : "#6e7681",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          <span>{btn.icon}</span>
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SummarySkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
      {[100, 85, 90, 60, 80, 45].map((w, i) => (
        <div
          key={i}
          style={{
            height: 12,
            borderRadius: 4,
            width: `${w}%`,
            background: "#1e1e2e",
            animation: "aiShimmer 1.4s infinite",
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIWeeklySummary({
  stats: externalStats,
  weekLabel = "This Week",
  onRefresh,
  showStats   = true,
  typewriter  = true,
}) {
  const [stats,         setStats]         = useState(externalStats || MOCK_STATS);
  const [summaryText,   setSummaryText]   = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [cooldown,      setCooldown]      = useState(false);
  const [feedback,      setFeedback]      = useState("");
  const [expanded,      setExpanded]      = useState(true);
  const [summaryIdx,    setSummaryIdx]    = useState(0);
  const cooldownRef = useRef();

  const { displayed, done } = useTypewriter(summaryText, typewriter && !loading);

  // ── Fetch / generate summary ──
  const generateSummary = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    setFeedback("");

    try {
      // ── Replace with real API call ────────────────────────────────────────
      // const res = await api.post("/ai/weekly-summary", { stats });
      // setSummaryText(res.data.summary);
      // setStats(res.data.stats);
      // ─────────────────────────────────────────────────────────────────────

      await new Promise((r) => setTimeout(r, 1400));

      const next = (summaryIdx + 1) % MOCK_SUMMARIES.length;
      setSummaryIdx(next);
      setSummaryText(MOCK_SUMMARIES[next]);
      setLastRefreshed(new Date());

    } catch {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [summaryIdx]);

  // ── Initial load ──
  useEffect(() => {
    setSummaryText(MOCK_SUMMARIES[0]);
    setLastRefreshed(new Date());
  }, []);

  // ── Manual refresh with cooldown ──
  function handleRefresh() {
    if (cooldown) return;
    generateSummary();
    onRefresh?.();
    setCooldown(true);
    cooldownRef.current = setTimeout(() => setCooldown(false), REFRESH_COOLDOWN_MS);
  }

  useEffect(() => () => clearTimeout(cooldownRef.current), []);

  // ── Date range label ──
  const now   = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const dateRange = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div
      style={{
        background: "#13131f",
        border: "1px solid #1e1e2e",
        borderRadius: 14,
        overflow: "hidden",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #1e1e2e",
          background: "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.04))",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* AI badge */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#e6edf3",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              AI Weekly Summary
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 20,
                  background: "rgba(79,70,229,0.2)",
                  color: "#818cf8",
                  border: "1px solid #4f46e544",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#6e7681", marginTop: 1 }}>
              {weekLabel} · {dateRange}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 11, color: "#6e7681" }}>
              Updated {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={cooldown || loading}
            title={cooldown ? "Please wait before refreshing again" : "Regenerate summary"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 10px",
              borderRadius: 7,
              border: "1px solid #2d2d3f",
              background: "none",
              color: cooldown || loading ? "#6e7681" : "#8b949e",
              fontSize: 12,
              fontWeight: 600,
              cursor: cooldown || loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (!cooldown && !loading) { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = cooldown || loading ? "#6e7681" : "#8b949e"; }}
          >
            <span
              style={{
                display: "inline-block",
                animation: loading ? "aiSpin 0.8s linear infinite" : "none",
              }}
            >
              🔄
            </span>
            {loading ? "Generating…" : cooldown ? "Cooling down…" : "Regenerate"}
          </button>

          {/* Collapse */}
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid #2d2d3f",
              background: "none",
              color: "#6e7681",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d2d3f")}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* ── Stats row ── */}
          {showStats && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "14px 20px",
                borderBottom: "1px solid #1e1e2e",
                flexWrap: "wrap",
                overflowX: "auto",
              }}
            >
              <StatPill
                icon="✅"
                label="Completed"
                value={formatNumber(stats.tasksCompleted)}
                color="#22c55e"
                delta={stats.velocityChange}
              />
              <StatPill
                icon="📋"
                label="Created"
                value={formatNumber(stats.tasksCreated)}
                color="#818cf8"
              />
              <StatPill
                icon="⏱"
                label="Hours logged"
                value={`${stats.hoursLogged}h`}
                color="#4f46e5"
              />
              <StatPill
                icon="📅"
                label="Avg. days"
                value={stats.avgCompletionDays}
                color="#f59e0b"
              />
            </div>
          )}

          {/* ── Risk badges ── */}
          {(stats.overdueTasks > 0 || stats.blockedTasks > 0) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderBottom: "1px solid #1e1e2e",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 11, color: "#6e7681", fontWeight: 600 }}>
                Risks:
              </span>
              <RiskBadge
                label="overdue"
                count={stats.overdueTasks}
                color="#ef4444"
                bg="rgba(239,68,68,0.1)"
              />
              <RiskBadge
                label="blocked"
                count={stats.blockedTasks}
                color="#f59e0b"
                bg="rgba(245,158,11,0.1)"
              />
            </div>
          )}

          {/* ── Mood bar ── */}
          <div
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid #1e1e2e",
            }}
          >
            <MoodBar score={stats.teamMoodScore} />
          </div>

          {/* ── Summary text ── */}
          <div style={{ padding: "18px 20px" }}>
            {error ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid #ef444433",
                  borderRadius: 9,
                  fontSize: 13,
                  color: "#f87171",
                }}
              >
                <span>⚠️</span>
                <span style={{ flex: 1 }}>{error}</span>
                <button
                  onClick={handleRefresh}
                  style={{
                    background: "none",
                    border: "1px solid #ef444433",
                    borderRadius: 6,
                    padding: "3px 10px",
                    color: "#f87171",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <SummarySkeleton />
            ) : (
              <>
                {/* Typewriter text */}
                <div
                  style={{
                    position: "relative",
                    lineHeight: 1.75,
                  }}
                >
                  {renderParagraphs(displayed)}

                  {/* Blinking cursor while typing */}
                  {!done && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 14,
                        background: "#818cf8",
                        marginLeft: 2,
                        verticalAlign: "middle",
                        animation: "aiCursor 0.8s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>

                {/* ── Footer actions (only after typing done) ── */}
                {done && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 18,
                      paddingTop: 14,
                      borderTop: "1px solid #1e1e2e",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <FeedbackRow
                      feedback={feedback}
                      onFeedback={setFeedback}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <CopyButton text={summaryText} />
                      <button
                        onClick={() => window.print()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid #2d2d3f",
                          background: "none",
                          color: "#6e7681",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#818cf8"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d3f"; e.currentTarget.style.color = "#6e7681"; }}
                      >
                        🖨 Print
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback thanks */}
                {feedback && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#22c55e",
                      animation: "aiFadeIn 0.2s ease both",
                    }}
                  >
                    ✓ Thanks for your feedback — it helps improve future summaries.
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Top contributor callout ── */}
          {!loading && !error && done && stats.topContributor && (
            <div
              style={{
                margin: "0 20px 20px",
                padding: "10px 14px",
                background: "rgba(79,70,229,0.07)",
                border: "1px solid #4f46e522",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 18 }}>🏆</span>
              <div>
                <span style={{ color: "#8b949e" }}>Top contributor this week: </span>
                <strong style={{ color: "#818cf8" }}>{stats.topContributor}</strong>
                <span style={{ color: "#6e7681" }}>
                  {" "}· focused on{" "}
                  <span style={{ color: "#c9d1d9" }}>{stats.focusArea}</span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes aiSpin    { to { transform: rotate(360deg); } }
        @keyframes aiPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes aiCursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aiShimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
        @keyframes aiFadeIn  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}