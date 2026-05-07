"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  const checkAuth = useCallback(() => {
    // Quick synchronous check
    const hasToken = isAuthenticated();
    
    if (!hasToken) {
      // Clear any stale tokens
      clearAuthTokens();
      setAuthState("unauthenticated");
      return;
    }
    
    setAuthState("authenticated");
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect when unauthenticated
  useEffect(() => {
    if (authState === "unauthenticated") {
      // Use replace to prevent back button issues
      router.replace("/login");
    }
  }, [authState, router]);

  // Re-check auth on visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && authState === "authenticated") {
        // Re-verify token exists when tab becomes visible
        if (!isAuthenticated()) {
          clearAuthTokens();
          setAuthState("unauthenticated");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [authState]);

  // Show loading spinner while checking auth
  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-surface)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show minimal loading while redirect happens
  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-surface)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
