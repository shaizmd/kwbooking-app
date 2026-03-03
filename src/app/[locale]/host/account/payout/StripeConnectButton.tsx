"use client";

import { useState, useEffect } from "react";

type OnboardingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE" | "RESTRICTED";

interface ConnectButtonProps {
  status: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  hasPayoutRecord: boolean;
  autoSync?: boolean; // true when returning from Stripe
}

export function StripeConnectButton({
  status: initialStatus,
  chargesEnabled: initialCharges,
  payoutsEnabled: initialPayouts,
  detailsSubmitted: initialDetails,
  hasPayoutRecord,
  autoSync = false,
}: ConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [chargesEnabled, setChargesEnabled] = useState(initialCharges);
  const [payoutsEnabled, setPayoutsEnabled] = useState(initialPayouts);
  const [detailsSubmitted, setDetailsSubmitted] = useState(initialDetails);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync status when returning from Stripe onboarding
  useEffect(() => {
    if (!autoSync) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/host/payout/status", { method: "POST" });
        const data = await res.json();
        if (data.status) {
          setStatus(data.status.onboardingStatus);
          setChargesEnabled(data.status.chargesEnabled);
          setPayoutsEnabled(data.status.payoutsEnabled);
          setDetailsSubmitted(data.status.detailsSubmitted);
        }
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetup = async () => {
    if (!hasPayoutRecord) {
      setError("Please save your legal/bank details first before setting up payouts.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/host/payout/onboard", { method: "POST" });
      const data = await res.json();
      if (data.alreadyComplete) {
        setStatus("COMPLETE");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to start Stripe setup.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<
    OnboardingStatus,
    { label: string; color: string; dot: string }
  > = {
    PENDING:     { label: "Not started",   color: "text-gray-600",  dot: "bg-gray-400" },
    IN_PROGRESS: { label: "In progress",   color: "text-yellow-700", dot: "bg-yellow-500" },
    COMPLETE:    { label: "Active",         color: "text-green-700", dot: "bg-green-500" },
    RESTRICTED:  { label: "Restricted",    color: "text-red-700",   dot: "bg-red-500" },
  };

  const cfg = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <div className="space-y-4">
      {/* Status badge row */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          Stripe Connect: {cfg.label}
        </span>
        {status === "COMPLETE" && (
          <>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${chargesEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {chargesEnabled ? "✓ Charges enabled" : "✗ Charges disabled"}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${payoutsEnabled ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
              {payoutsEnabled ? "✓ Payouts enabled" : "⏳ Payouts pending"}
            </span>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {status !== "COMPLETE" && (
        <button
          type="button"
          onClick={handleSetup}
          disabled={loading}
          className="flex items-center gap-2 bg-[#635bff] hover:bg-[#5248e6] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Redirecting...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.887 24 11.845 24c2.72 0 4.874-.675 6.36-1.980 1.55-1.345 2.37-3.3 2.37-5.647-.01-4.135-2.52-5.897-6.599-7.223z"/>
              </svg>
              {status === "IN_PROGRESS" ? "Continue Stripe setup" : "Set up Stripe payouts"}
            </>
          )}
        </button>
      )}

      {status === "COMPLETE" && (
        <p className="text-sm text-gray-500">
          Payments from bookings will settle directly to your bank account via Stripe.
          The platform fee is deducted automatically.
        </p>
      )}

      {(status === "IN_PROGRESS" || status === "PENDING") && (
        <p className="text-sm text-gray-500">
          Complete Stripe Express onboarding to enable direct payouts to your bank account.
          This typically takes 5–10 minutes.
        </p>
      )}
    </div>
  );
}
