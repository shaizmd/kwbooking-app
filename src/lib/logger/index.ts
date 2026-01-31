/**
 * Structured Error Logging Utilities
 * 
 * Provides standardized error logging for:
 * - Payment failures
 * - Webhook processing errors
 * - Cron job failures
 * - Critical system errors
 * 
 * Later: Integrate with Sentry, Logflare, or Datadog
 */

type ErrorContext = {
  userId?: string;
  bookingId?: string;
  paymentId?: string;
  propertyId?: string;
  [key: string]: string | number | boolean | undefined;
};

type ErrorLevel = "error" | "warn" | "info";

export class Logger {
  private static formatMessage(
    level: ErrorLevel,
    category: string,
    message: string,
    context?: ErrorContext,
    error?: Error
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    const errorStr = error ? ` | Error: ${error.message}\n${error.stack}` : "";
    
    return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}${contextStr}${errorStr}`;
  }

  /**
   * Payment-related errors
   */
  static payment(
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(this.formatMessage("error", "PAYMENT", message, context, error));
    
    // TODO: Send to external monitoring service
    // Sentry.captureException(error, { tags: { category: "payment" }, extra: context });
  }

  /**
   * Webhook processing errors
   */
  static webhook(
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(this.formatMessage("error", "WEBHOOK", message, context, error));
    
    // TODO: Send to external monitoring service
  }

  /**
   * Cron job failures
   */
  static cron(
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(this.formatMessage("error", "CRON", message, context, error));
    
    // TODO: Send to external monitoring service
  }

  /**
   * Authentication/authorization errors
   */
  static auth(
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(this.formatMessage("error", "AUTH", message, context, error));
    
    // TODO: Send to external monitoring service
  }

  /**
   * Database errors
   */
  static database(
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(this.formatMessage("error", "DATABASE", message, context, error));
    
    // TODO: Send to external monitoring service
  }

  /**
   * General warnings
   */
  static warn(
    category: string,
    message: string,
    context?: ErrorContext
  ): void {
    console.warn(this.formatMessage("warn", category, message, context));
  }

  /**
   * Info logs (non-errors)
   */
  static info(
    category: string,
    message: string,
    context?: ErrorContext
  ): void {
    console.log(this.formatMessage("info", category, message, context));
  }

  /**
   * Critical errors that require immediate attention
   */
  static critical(
    category: string,
    message: string,
    context?: ErrorContext,
    error?: Error
  ): void {
    console.error(
      `🚨 CRITICAL: ${this.formatMessage("error", category, message, context, error)}`
    );
    
    // TODO: Send alert (email, Slack, PagerDuty)
    // TODO: Send to external monitoring service with high priority
  }
}

/**
 * Helper to create audit log entries
 */
export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, string | number | boolean>,
  ipAddress?: string
) {
  try {
    const { db } = await import("@/lib/db");
    
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
      },
    });
  } catch {
    // Don't throw - audit log failure shouldn't break main flow
    Logger.warn("AUDIT", "Failed to create audit log", {
      userId,
      action,
      entityType,
      entityId,
    });
  }
}
