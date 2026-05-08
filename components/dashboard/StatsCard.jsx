// flowdesk-frontend/components/dashboard/StatsCard.jsx

"use client";

import { useState, useEffect, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatValue(value, prefix = "", suffix = "") {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return String(value);
  if (num >= 1_000_000) return `${prefix}${(num / 1_000_000).toFixed(1)}M${suffix}`;
  if (num >= 1_000)     return `${prefix}${(num / 1_000).toFixed(1)}k${suffix}`;
  if (num % 1 !== 0)    return `${prefix}${num.toFixed(1)}${suffix}`;
  return `${prefix}${num}${suffix}`;
}

// ─── Count-up animation hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 1200, enabled = true) {
  const [current, setCurrent] = useState(0);
  const rafRef  = useRef();
  const startRef = useRef();

  useEffect(() => {
    if (!enabled || typeof target !== "number") {
      setCurrent(target);
      return;
    }
    setCurrent(0);
    startRef.current = null;

    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return current;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = "#4f46e5", height = 40, width = 100 }) {
  if (!data || data.length < 2) return null;

  const min  = Math.min(...data);
  const max  = Math.max(...data);
  const range = max - min || 1;
  const padX  = 2;
  const padY  = 4;
  const W     = width  - padX * 2;
  const H     = height - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * W;
    const y = padY + (1 - (v - min) / range) * H;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Area fill path
  const firstX = padX;
  const lastX  = padX + W;
  const baseY  = padY + H;
  const area   = `${firstX},${baseY} ${polyline} ${lastX},${baseY}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      {/* Area fill */}
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon
        points={area}
        fill={`url(#sg-${color.replace("#","")})`}
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

// ─── Trend Badge ──────────────────────────────────────────────────────────────
function TrendBadge({ delta, deltaLabel, invertColor = false }) {
  if (delta === undefined || delta === null) return null;

  const positive  = invertColor ? delta < 0 : delta > 0;
  const neutral   = delta === 0;
  const color     = neutral ? "#6e7681" : positive ? "#22c55e" : "#ef4444";
  const bg        = neutral ? "rgba(110,118,129,0.1)" : positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)";
  const arrow     = neutral ? "→" : delta > 0 ? "▲" : "▼";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${color}22`,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span>{arrow}</span>
      <span>{Math.abs(delta)}%</span>
      {deltaLabel && (
        <span style={{ fontWeight: 400, opacity: 0.8 }}>{deltaLabel}</span>
      )}
    </span>
  );
}

// ─── Mini Progress Bar ────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#6e7681",
          marginBottom: 4,
        }}
      >
        <span>Progress</span>
        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 4,
          background: "#1e1e2e",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            borderRadius: 2,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      style={{
        background: "#13131f",
        border: "1px solid #1e1e2e",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {[60, 40, 80].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 1 ? 28 : 12,
            width: `${w}%`,
            borderRadius: 4,
            background: "#1e1e2e",
            animation: "scShimmer 1.4s infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StatsCard({
  // Content
  title,
  value,
  prefix       = "",
  suffix       = "",
  icon,
  description,

  // Trend
  delta,
  deltaLabel   = "vs last week",
  invertColor  = false,

  // Sparkline
  sparklineData,

  // Progress
  progressMax,
  progressLabel,

  // Secondary stat
  secondaryValue,
  secondaryLabel,

  // Appearance
  color        = "#4f46e5",
  accentBg,
  loading      = false,
  hoverable    = true,
  onClick,
  countUp      = true,

  // Status dot
  status,       // "online" | "warning" | "error" | undefined

  // Footer slot
  footer,
}) {
  const [hovered,  setHovered]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const cardRef = useRef();

  // Intersection observer — trigger countUp when card enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const numericValue  = typeof value === "number" ? value : parseFloat(value);
  const isNumeric     = !isNaN(numericValue);
  const animatedValue = useCountUp(
    isNumeric ? numericValue : 0,
    1200,
    countUp && visible && isNumeric
  );

  const displayValue = isNumeric
    ? formatValue(animatedValue, prefix, suffix)
    : formatValue(value, prefix, suffix);

  const STATUS_COLORS = {
    online:  "#22c55e",
    warning: "#f59e0b",
    error:   "#ef4444",
  };

  if (loading) return <CardSkeleton />;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: accentBg || "#13131f",
        border: `1px solid ${hovered && hoverable ? color + "55" : "#1e1e2e"}`,
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: onClick ? "pointer" : hoverable ? "default" : "default",
        transition: "all 0.2s ease",
        transform: hovered && hoverable ? "translateY(-2px)" : "none",
        boxShadow: hovered && hoverable
          ? `0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px ${color}22`
          : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${color}, ${color}00)`,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.2s",
        }}
      />

      {/* ── Top row: icon + title + status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${color}18`,
                border: `1px solid ${color}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
                transition: "transform 0.2s",
                transform: hovered ? "scale(1.08)" : "scale(1)",
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6e7681",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                lineHeight: 1,
              }}
            >
              {title}
            </div>
            {description && (
              <div style={{ fontSize: 10, color: "#6e7681", marginTop: 3, opacity: 0.7 }}>
                {description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {status && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: STATUS_COLORS[status] || "#6e7681",
                animation: status === "online" ? "scPulse 1.8s ease-in-out infinite" : "none",
                flexShrink: 0,
              }}
              title={status}
            />
          )}
          {sparklineData && (
            <Sparkline
              data={sparklineData}
              color={color}
              height={36}
              width={80}
            />
          )}
        </div>
      </div>

      {/* ── Main value ── */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color,
          letterSpacing: -1,
          lineHeight: 1,
          marginBottom: 8,
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.2s",
        }}
      >
        {displayValue}
      </div>

      {/* ── Trend badge ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <TrendBadge
          delta={delta}
          deltaLabel={deltaLabel}
          invertColor={invertColor}
        />

        {/* Secondary stat */}
        {secondaryValue !== undefined && (
          <span style={{ fontSize: 12, color: "#6e7681" }}>
            <span style={{ color: "#8b949e", fontWeight: 600 }}>
              {formatValue(secondaryValue, prefix, suffix)}
            </span>
            {secondaryLabel && (
              <span style={{ marginLeft: 4 }}>{secondaryLabel}</span>
            )}
          </span>
        )}
      </div>

      {/* ── Progress bar ── */}
      {progressMax !== undefined && (
        <ProgressBar
          value={isNumeric ? numericValue : 0}
          max={progressMax}
          color={color}
        />
      )}

      {/* ── Footer ── */}
      {footer && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #1e1e2e",
            fontSize: 12,
            color: "#6e7681",
          }}
        >
          {footer}
        </div>
      )}

      <style>{`
        @keyframes scShimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
        @keyframes scPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
      `}</style>
    </div>
  );
}