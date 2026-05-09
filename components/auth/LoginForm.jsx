// flowdesk-frontend/components/auth/LoginForm.jsx
// FIXED: Replaced mock login with real API call via AuthContext

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GoogleButton, { GitHubButton, OAuthDivider } from "../auth/GoogleButton";
import TwoFactorForm from "./TwoFactorForm";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_PASSWORD_LENGTH = 6;
const MAX_LOGIN_ATTEMPTS  = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getStoredAttempts() {
  try {
    return JSON.parse(localStorage.getItem("fd_login_attempts") || "{}");
  } catch {
    return {};
  }
}

function storeAttempt() {
  const data = getStoredAttempts();
  const now  = Date.now();
  const attempts = (data.attempts || []).filter((t) => now - t < LOCKOUT_DURATION_MS);
  attempts.push(now);
  localStorage.setItem("fd_login_attempts", JSON.stringify({ attempts }));
  return attempts.length;
}

function clearAttempts() {
  localStorage.removeItem("fd_login_attempts");
}

function getRemainingLockout() {
  const data = getStoredAttempts();
  const now  = Date.now();
  const recent = (data.attempts || []).filter((t) => now - t < LOCKOUT_DURATION_MS);
  if (recent.length < MAX_LOGIN_ATTEMPTS) return 0;
  const oldest = Math.min(...recent);
  return Math.ceil((LOCKOUT_DURATION_MS - (now - oldest)) / 1000);
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({
  label, type, value, onChange, placeholder, error, autoComplete,
  autoFocus, icon, onKeyDown, required, disabled, children,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8b949e",
          textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            fontSize: 15, color: focused ? "#818cf8" : "#6e7681", pointerEvents: "none",
            transition: "color 0.2s", zIndex: 1 }}>
            {icon}
          </span>
        )}
        <input
          type={inputType} value={value} onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete} autoFocus={autoFocus} onKeyDown={onKeyDown}
          required={required} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: `10px ${isPassword ? "40px" : "12px"} 10px ${icon ? "36px" : "12px"}`,
            background: disabled ? "rgba(255,255,255,0.02)" : "#161622",
            border: `1px solid ${error ? "#ef4444" : focused ? "#4f46e5" : "#2d2d3f"}`,
            borderRadius: 8, color: disabled ? "#6e7681" : "#e6edf3", fontSize: 14,
            outline: "none", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused && !error ? "0 0 0 3px rgba(79,70,229,0.12)"
              : focused && error ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#6e7681",
              fontSize: 15, padding: 4, lineHeight: 1, transition: "color 0.15s" }}
            title={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5,
          fontSize: 11, color: "#ef4444", fontWeight: 500 }}>
          <span>⚠</span><span>{error}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Lockout Timer ────────────────────────────────────────────────────────────
function LockoutBanner({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  const pct = Math.round((remaining / (LOCKOUT_DURATION_MS / 1000)) * 100);
  return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef444433",
      borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>Account temporarily locked</div>
          <div style={{ fontSize: 12, color: "#fca5a5", marginTop: 1 }}>
            Too many failed attempts. Try again in <strong>{remaining}s</strong>.
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: "#2d2d3f", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#ef4444",
          borderRadius: 2, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(239,68,68,0.08)",
      border: "1px solid #ef444433", borderRadius: 9, padding: "11px 14px", marginBottom: 18,
      animation: "lfFadeIn 0.2s ease both" }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <span style={{ flex: 1, fontSize: 13, color: "#f87171", lineHeight: 1.5 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer",
        color: "#f87171", fontSize: 16, padding: 0, lineHeight: 1, opacity: 0.6, flexShrink: 0 }}>×</button>
    </div>
  );
}

function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.08)",
      border: "1px solid #22c55e33", borderRadius: 9, padding: "11px 14px", marginBottom: 18,
      fontSize: 13, color: "#86efac", animation: "lfFadeIn 0.2s ease both" }}>
      <span style={{ fontSize: 16 }}>✅</span><span>{message}</span>
    </div>
  );
}

function RememberMe({ checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
      <div onClick={() => onChange(!checked)} style={{ width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${checked ? "#4f46e5" : "#2d2d3f"}`, background: checked ? "#4f46e5" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        transition: "all 0.15s", cursor: "pointer" }}>
        {checked && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: "#8b949e" }}>Remember me</span>
    </label>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LoginForm({ onSuccess, redirectTo = "/dashboard" }) {
  const router = useRouter();
  const emailRef = useRef();
  // FIX: Use real auth context instead of mock
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors]             = useState({});
  const [serverError, setServerError]   = useState("");
  const [successMsg, setSuccessMsg]     = useState("");
  const [loading, setLoading]           = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [rememberMe, setRememberMe]     = useState(false);
  const [lockedOut, setLockedOut]       = useState(false);
  const [lockoutSecs, setLockoutSecs]   = useState(0);
  // FIX: State for 2FA flow
  const [twoFAUserId, setTwoFAUserId]   = useState(null);

  useEffect(() => {
    const secs = getRemainingLockout();
    if (secs > 0) { setLockedOut(true); setLockoutSecs(secs); }
    const saved = localStorage.getItem("fd_remembered_email");
    if (saved) { setForm((f) => ({ ...f, email: saved })); setRememberMe(true); }
    emailRef.current?.focus();
  }, []);

  function set(key) {
    return (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: "" }));
      setServerError("");
    };
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Please enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < MIN_PASSWORD_LENGTH)
      errs.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    return errs;
  }

  // FIX: Real login using AuthContext — no more mock token
  async function handleSubmit(e) {
    e.preventDefault();
    if (lockedOut) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const data = await login(form.email.trim().toLowerCase(), form.password);

      // FIX: Handle 2FA requirement
      if (data.twoFactorRequired) {
        setTwoFAUserId(data.userId);
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("fd_remembered_email", form.email.trim());
      } else {
        localStorage.removeItem("fd_remembered_email");
      }

      clearAttempts();
      setSuccessMsg("Login successful! Redirecting…");
      setTimeout(() => {
        onSuccess?.();
        router.push(redirectTo);
      }, 600);

    } catch (err) {
      const count = storeAttempt();
      if (count >= MAX_LOGIN_ATTEMPTS) {
        setLockedOut(true);
        setLockoutSecs(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setServerError("");
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - count;
        const msg = err.response?.data?.message || "Invalid email or password.";
        setServerError(`${msg} ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  }

  // FIX: Real OAuth redirect
  async function handleOAuth(provider) {
    setOauthLoading(provider);
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
    } catch {
      setServerError(`Failed to connect with ${provider}. Please try again.`);
      setOauthLoading("");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit(e);
  }

  // FIX: Show TwoFactorForm when 2FA is required
  if (twoFAUserId) {
    return (
      <TwoFactorForm
        userId={twoFAUserId}
        onSuccess={() => {
          clearAttempts();
          setSuccessMsg("Login successful! Redirecting…");
          setTimeout(() => { onSuccess?.(); router.push(redirectTo); }, 600);
        }}
        onBack={() => setTwoFAUserId(null)}
      />
    );
  }

  const isDisabled = loading || lockedOut || !!successMsg;

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", width: "100%" }}>
      {lockedOut && (
        <LockoutBanner seconds={lockoutSecs} onExpire={() => { setLockedOut(false); clearAttempts(); }} />
      )}
      <ErrorBanner message={serverError} onDismiss={() => setServerError("")} />
      <SuccessBanner message={successMsg} />

      {!lockedOut && !successMsg && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <GoogleButton onClick={() => handleOAuth("google")} loading={oauthLoading === "google"}
              disabled={!!oauthLoading && oauthLoading !== "google"} />
            <GitHubButton onClick={() => handleOAuth("github")} loading={oauthLoading === "github"}
              disabled={!!oauthLoading && oauthLoading !== "github"} />
          </div>
          <OAuthDivider />
          <div style={{ marginBottom: 20 }} />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email address" type="email" value={form.email} onChange={set("email")}
          placeholder="you@company.com" error={errors.email} autoComplete="email" autoFocus
          icon="✉️" onKeyDown={handleKeyDown} required disabled={isDisabled} />
        <Field label="Password" type="password" value={form.password} onChange={set("password")}
          placeholder="••••••••" error={errors.password} autoComplete="current-password"
          icon="🔑" onKeyDown={handleKeyDown} required disabled={isDisabled} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 22, flexWrap: "wrap", gap: 8 }}>
          <RememberMe checked={rememberMe} onChange={setRememberMe} />
          <Link href="/forgot-password" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isDisabled} style={{
          width: "100%", padding: "11px 0", borderRadius: 9, border: "none",
          background: isDisabled ? "#2d2d3f" : successMsg ? "rgba(34,197,94,0.2)"
            : "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: isDisabled && !successMsg ? "#6e7681" : successMsg ? "#22c55e" : "#fff",
          fontSize: 14, fontWeight: 700, cursor: isDisabled ? "not-allowed" : "pointer",
          fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          boxShadow: !isDisabled && !successMsg ? "0 4px 20px rgba(79,70,229,0.4)" : "none",
          transition: "all 0.25s",
        }}>
          {loading ? (
            <><span style={{ width: 16, height: 16, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff",
              animation: "lfSpin 0.7s linear infinite", display: "inline-block" }} />Signing in…</>
          ) : successMsg ? "✓ Signed in!" : lockedOut ? "🔒 Account locked" : "Sign In →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "#6e7681", marginTop: 20, marginBottom: 0 }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
          Create one free →
        </Link>
      </p>

      <style>{`
        @keyframes lfSpin   { to { transform: rotate(360deg); } }
        @keyframes lfFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
