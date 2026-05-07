import { API_URL } from "./api";

// Flag to prevent multiple simultaneous logouts
let isLoggingOut = false;

/**
 * Clear all auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("superadmin_access_token");
  localStorage.removeItem("superadmin_refresh_token");
  localStorage.removeItem("superadmin_user");
}

/**
 * Redirect to login page
 * Uses a flag to prevent multiple redirects
 */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (isLoggingOut) return;
  
  isLoggingOut = true;
  
  // Use replace to prevent back button returning to protected page
  window.location.replace("/login");
}

/**
 * Full logout flow: call API (with session revocation), clear tokens, redirect
 */
export async function logout(): Promise<void> {
  if (isLoggingOut) return;
  
  try {
    const accessToken = localStorage.getItem("superadmin_access_token");
    
    if (accessToken) {
      // Call the new logout endpoint with Bearer token for session revocation
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.warn("Logout API failed (ignored)", error);
  }

  clearAuthTokens();
  redirectToLogin();
}
