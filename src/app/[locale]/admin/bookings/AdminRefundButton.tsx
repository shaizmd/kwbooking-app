"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminRefundButtonProps {
  bookingId: string;
  guestName: string;
  amount: string;
  currency: string;
}

export function AdminRefundButton({
  bookingId,
  guestName,
  amount,
  currency,
}: AdminRefundButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <span className="text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full">
        ✓ Refunded
      </span>
    );
  }

  if (!confirmed) {
    return (
      <button
        type="button"
        onClick={() => setConfirmed(true)}
        className="text-xs text-orange-600 hover:text-orange-800 font-medium border border-orange-200 hover:border-orange-400 rounded-full px-3 py-1 transition-colors"
      >
        Refund
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-700 font-medium">
        Refund {amount} {currency} to {guestName}?
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmed(false)}
          disabled={loading}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch(`/api/bookings/${bookingId}/refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "requested_by_customer" }),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error ?? "Refund failed.");
              } else {
                setDone(true);
                router.refresh();
              }
            } catch {
              setError("Network error.");
            } finally {
              setLoading(false);
            }
          }}
          className="text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-3 py-1 rounded font-semibold transition-colors"
        >
          {loading ? "Processing…" : "Confirm refund"}
        </button>
      </div>
    </div>
  );
}
