import { requireRole } from "@/lib/auth/require-role";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");

  // Get current platform settings
  const settings = await db.platformSettings.findUnique({
    where: { id: "default" },
  });

  // Get recent cron job stats (last 24 hours)
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  
  const [
    expiredSubsCount,
    cancelledBookingsCount,
    cleanedSessionsCount,
  ] = await Promise.all([
    db.subscription.count({
      where: {
        status: "EXPIRED",
        updatedAt: { gte: oneDayAgo },
      },
    }),
    db.booking.count({
      where: {
        status: "CANCELLED",
        cancellationReason: { contains: "auto-cancelled" },
        updatedAt: { gte: oneDayAgo },
      },
    }),
    db.session.count({
      where: {
        expiresAt: { lt: new Date() },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          Platform Settings
        </h1>
        <p style={{ color: "#666" }}>
          Emergency controls and automated job monitoring
        </p>
      </div>

      {/* Kill Switches */}
      <div style={{
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "24px",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "999px",
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              color: "#d32f2f",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
            }}
            aria-hidden="true"
          >
            !
          </span>
          Emergency Kill Switches
        </h2>
        
        <div style={{ marginBottom: "16px", padding: "12px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px" }}>
          <p style={{ fontSize: "14px", color: "#856404" }}>
            <strong>Warning:</strong> These controls immediately affect all users. Use only in emergencies.
          </p>
        </div>

        <form action="/api/admin/settings/update" method="POST" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
          }}>
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>
                New Bookings
              </h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Allow customers to create new bookings
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="bookingsEnabled"
                defaultChecked={settings?.bookingsEnabled ?? true}
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ fontWeight: "500", color: settings?.bookingsEnabled ? "#16a34a" : "#dc2626" }}>
                {settings?.bookingsEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
          }}>
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>
                Payment Processing
              </h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Allow payment intent creation and processing
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="paymentsEnabled"
                defaultChecked={settings?.paymentsEnabled ?? true}
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ fontWeight: "500", color: settings?.paymentsEnabled ? "#16a34a" : "#dc2626" }}>
                {settings?.paymentsEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
          }}>
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>
                New Property Listings
              </h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Allow hosts to create new property listings
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="newPropertiesEnabled"
                defaultChecked={settings?.newPropertiesEnabled ?? true}
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ fontWeight: "500", color: settings?.newPropertiesEnabled ? "#16a34a" : "#dc2626" }}>
                {settings?.newPropertiesEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              background: "#d32f2f",
              color: "white",
              padding: "12px 24px",
              borderRadius: "4px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Update Settings
          </button>
        </form>
      </div>

      {/* Cron Job Monitoring */}
      <div style={{
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "24px",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
        }}>
          Automated Jobs (Last 24 Hours)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div style={{
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
            background: "#f9fafb",
          }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Expired Subscriptions
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#d32f2f" }}>
              {expiredSubsCount}
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              Runs daily at 00:00 KWT
            </div>
          </div>

          <div style={{
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
            background: "#f9fafb",
          }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Auto-Cancelled Bookings
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#d32f2f" }}>
              {cancelledBookingsCount}
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              Runs every 15 minutes
            </div>
          </div>

          <div style={{
            padding: "16px",
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
            background: "#f9fafb",
          }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Expired Sessions (Pending)
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#d32f2f" }}>
              {cleanedSessionsCount}
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              Runs daily at 02:00 KWT
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <form action="/api/admin/settings/run-jobs" method="POST">
            <button
              type="submit"
              style={{
                background: "white",
                color: "#222",
                padding: "10px 20px",
                borderRadius: "4px",
                fontWeight: "600",
                border: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              Run All Jobs Manually
            </button>
          </form>
        </div>
      </div>

      {/* Environment Info */}
      <div style={{
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "24px",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
        }}>
          System Status
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ color: "#666" }}>Environment:</span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>
              {process.env.NODE_ENV}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ color: "#666" }}>Database:</span>
            <span style={{ fontWeight: "600", color: "#16a34a" }}>Connected</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ color: "#666" }}>Stripe:</span>
            <span style={{ fontWeight: "600", color: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "#16a34a" : "#fbbf24" }}>
              {process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "Live Mode" : "Test Mode"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: "#666" }}>Rate Limiting:</span>
            <span style={{ fontWeight: "600", color: "#16a34a" }}>Active (In-Memory)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
