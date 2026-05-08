// flowdesk-frontend/components/shared/ProtectedRoute.jsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fd_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Role check — in production decode the JWT; here we mock it
    if (requiredRole) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || "e30="));
        const userRole = payload.role || "member";
        const roleHierarchy = { admin: 4, manager: 3, developer: 2, designer: 2, viewer: 1, member: 1 };
        const userLevel = roleHierarchy[userRole.toLowerCase()] || 1;
        const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 1;
        if (userLevel < requiredLevel) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Mock token — allow access in dev
      }
    }

    setAuthorized(true);
    setChecking(false);
  }, [router, requiredRole]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d1a",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "3px solid #1e1e2e",
              borderTopColor: "#4f46e5",
              animation: "spin 0.75s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <div style={{ fontSize: 13, color: "#6e7681" }}>Verifying access…</div>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}