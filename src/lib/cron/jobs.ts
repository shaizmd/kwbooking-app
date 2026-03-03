/**
 * Automated Cron Jobs for Production Safety
 * 
 * These jobs handle:
 * - Subscription expiry enforcement
 * - Unpaid booking cancellation
 * - Session cleanup (security)
 * 
 * Schedule via Vercel Cron or node-cron
 */

import { db } from "@/lib/db";
import { Logger } from "@/lib/logger";

/**
 * Job 1: Auto-expire Host Subscriptions
 * Schedule: Daily at 00:00 Kuwait time (UTC+3)
 * 
 * Prevents hosts from keeping listings live without paying
 * Deactivates properties when subscription expires
 */
export async function expireSubscriptionsJob() {
  Logger.info("CRON", "Starting subscription expiry job");
  
  try {
    const now = new Date();
    
    // Mark expired subscriptions as EXPIRED
    const expiredSubs = await db.subscription.updateMany({
      where: {
        endsAt: { lt: now },
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
      },
    });

    Logger.info("CRON", `Expired ${expiredSubs.count} subscriptions`);

    // Deactivate properties for hosts with NO active subscription
    // Uses NOT IN to avoid false-positives where a host has both expired
    // and current active subscriptions — only deactivate truly unsubscribed hosts.
    const deactivatedProps = await db.$executeRaw`
      UPDATE "Property"
      SET status = 'INACTIVE'
      WHERE "hostId" NOT IN (
        SELECT DISTINCT "hostId"
        FROM "Subscription"
        WHERE status = 'ACTIVE' AND "endsAt" > NOW()
      )
      AND status = 'ACTIVE'
    `;

    Logger.info("CRON", `Deactivated ${deactivatedProps} properties`);

    return {
      success: true,
      expiredSubscriptions: expiredSubs.count,
      deactivatedProperties: deactivatedProps,
    };
  } catch (error) {
    Logger.cron("Subscription expiry job failed", {}, error as Error);
    throw error;
  }
}

/**
 * Job 2: Auto-cancel Unpaid Bookings
 * Schedule: Every 15 minutes
 * 
 * Cancels bookings that remain PENDING for >15 minutes
 * Prevents inventory blocking and revenue loss
 */
export async function cancelUnpaidBookingsJob() {
  Logger.info("CRON", "Starting unpaid booking cancellation job");
  
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const cancelledBookings = await db.booking.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: fifteenMinutesAgo },
      },
      data: {
        status: "CANCELLED",
        cancellationReason: "Payment not completed within 15 minutes (auto-cancelled)",
      },
    });

    Logger.info("CRON", `Cancelled ${cancelledBookings.count} unpaid bookings`);

    return {
      success: true,
      cancelledCount: cancelledBookings.count,
    };
  } catch (error) {
    Logger.cron("Unpaid booking cancellation job failed", {}, error as Error);
    throw error;
  }
}

/**
 * Job 3: Session Cleanup (Security)
 * Schedule: Daily at 02:00 Kuwait time
 * 
 * Removes expired refresh tokens
 * Reduces DB bloat and security risk
 */
export async function cleanupExpiredSessionsJob() {
  Logger.info("CRON", "Starting session cleanup job");
  
  try {
    const now = new Date();

    const deletedSessions = await db.session.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    Logger.info("CRON", `Cleaned up ${deletedSessions.count} expired sessions`);

    return {
      success: true,
      deletedCount: deletedSessions.count,
    };
  } catch (error) {
    Logger.cron("Session cleanup job failed", {}, error as Error);
    throw error;
  }
}

/**
 * Health Check - Run all jobs manually (admin trigger)
 */
export async function runAllMaintenanceJobs() {
  console.log("[CRON] Running all maintenance jobs...");
  
  const results = await Promise.allSettled([
    expireSubscriptionsJob(),
    cancelUnpaidBookingsJob(),
    cleanupExpiredSessionsJob(),
  ]);

  return {
    subscriptions: results[0],
    bookings: results[1],
    sessions: results[2],
  };
}
