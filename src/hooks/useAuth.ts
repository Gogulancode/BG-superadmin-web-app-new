import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginSuperadmin, LoginCredentials, LoginResponse, isMfaRequired, isAuthenticated, getSuperadminUser } from "@/lib/api";
import { logout } from "@/lib/auth";

// Login mutation
export function useLogin() {
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginSuperadmin,
    onSuccess: (data) => {
      // Only redirect if login is complete (no MFA required)
      if (!isMfaRequired(data)) {
        router.push("/dashboard");
      }
    },
  });
}

// Logout helper
export function useLogout() {
  return {
    logout: () => {
      logout();
    },
  };
}

// Auth state helpers
export function useAuthState() {
  return {
    isAuthenticated: isAuthenticated(),
    user: getSuperadminUser(),
  };
}
