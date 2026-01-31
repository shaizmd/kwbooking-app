import { requireAuth } from "./require-auth";
import { UserRole } from "@prisma/client";

/**
 * Require specific role for server components/actions
 * Throws error if user doesn't have required role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();
  
  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
}
