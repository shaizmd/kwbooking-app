import crypto from "crypto";
import { prisma } from "@/lib/db";

/**
 * Hash refresh token before storing
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  refreshToken: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
) {
  return prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string) {
  return prisma.session.delete({
    where: { id: sessionId },
  });
}

/**
 * Revoke all sessions for a user (logout from all devices)
 */
export async function revokeAllUserSessions(userId: string) {
  return prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Clean up expired sessions (run as cron job)
 */
export async function cleanupExpiredSessions() {
  return prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
