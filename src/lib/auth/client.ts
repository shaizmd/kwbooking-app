/**
 * Authentication API client utilities
 * Use these in client components for auth operations
 */

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "HOST" | "CUSTOMER";
  fullName: string | null;
  phone: string | null;
  isKycApproved: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  fullName?: string;
  role?: "ADMIN" | "HOST" | "CUSTOMER";
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }

  return res.json();
}

/**
 * Login user
 */
export async function login(data: LoginData) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }

  return res.json();
}

/**
 * Logout user
 */
export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.user;
}

/**
 * Refresh access token
 */
export async function refreshToken() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json();
}

/**
 * Protected fetch with automatic token refresh
 */
export async function protectedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If unauthorized, try to refresh token and retry
  if (res.status === 401) {
    try {
      await refreshToken();
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } catch {
      // Refresh failed, redirect to login
      window.location.href = "/login";
    }
  }

  return res;
}
