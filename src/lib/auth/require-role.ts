import { requireAuth } from "./require-auth";
import { UserRole } from "@prisma/client";

/**
 * Require specific role for server components/actions
 * Throws error if user doesn't have required role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  console.log("requireRole check for roles:", role);
  const user = await requireAuth();
  console.log("requireRole - Authenticated User ID:", user.sub, "Role:", user.role);
  
  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    console.log(`Forbidden: User role ${user.role} not in allowed roles:`, allowedRoles);
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
}
