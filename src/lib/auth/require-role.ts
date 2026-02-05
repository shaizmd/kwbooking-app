import { requireAuth } from "./require-auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Require specific role for server components/actions
 * Throws error if user doesn't have required role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    // Not authenticated -> redirect to login
    redirect("/login");
  }

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(user.role as UserRole)) {
    // Authenticated but wrong role -> show 403 page
    redirect("/403");
  }

  return user;
}
