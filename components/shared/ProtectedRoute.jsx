'use client'

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Role check
  useEffect(() => {
    if (!loading && user && requiredRole) {
      const roleHierarchy = { admin: 4, manager: 3, developer: 2, designer: 2, viewer: 1, member: 1 };
      const userLevel     = roleHierarchy[(user.role || "member").toLowerCase()] || 1;
      const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 1;
      if (userLevel < requiredLevel) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d0d1a", fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", border: "3px solid #1e1e2e",
            borderTopColor: "#4f46e5", animation: "spin 0.75s linear infinite",
            margin: "0 auto 12px",
          }} />
          <div style={{ fontSize: 13, color: "#6e7681" }}>Verifying access…</div>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
