"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BookingStatusPollProps {
  bookingId: string;
  initialStatus: string;
  locale: string;
}

export function BookingStatusPoll({
  bookingId,
  initialStatus,
  locale,
}: BookingStatusPollProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    // Only poll if not confirmed
    if (status === "CONFIRMED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "CONFIRMED") {
            setStatus("CONFIRMED");
            router.refresh();
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [bookingId, status, router]);

  if (status !== "CONFIRMED") {
    return (
      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-amber-800">
          {locale === "ar" 
            ? "نحن بانتظار تأكيد الدفع من قبل البنك... سيتم تحديث الصفحة تلقائياً." 
            : "Waiting for payment confirmation... This page will update automatically."}
        </p>
      </div>
    );
  }

  return null;
}
