"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { parseISO, eachDayOfInterval } from "date-fns";
import "react-day-picker/style.css";

interface UnavailableRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

interface Props {
  propertyId: string;
}

/**
 * Read-only calendar showing which dates are unavailable for a property.
 * Booked/blocked dates are visually highlighted with a red background.
 *
 * Data is fetched from GET /api/properties/[id]/availability.
 */
export default function AvailabilityCalendar({ propertyId }: Props) {
  const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/availability`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setUnavailableRanges(data.unavailableRanges || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [propertyId]);

  // Expand ranges into individual day matchers for DayPicker
  const disabledDays = unavailableRanges.flatMap((range) => {
    try {
      const from = parseISO(range.from);
      const to = parseISO(range.to);
      return eachDayOfInterval({ start: from, end: to });
    } catch {
      return [];
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-64 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return null; // Silently hide on error — availability check is supplementary
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-900">Availability</h3>
        <span className="text-sm text-gray-500">— check which dates are open</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
          Available
        </span>
      </div>

      {unavailableRanges.length === 0 ? (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          ✓ This property has no upcoming bookings — all dates are currently available!
        </p>
      ) : (
        <div
          className="[&_.rdp-day_button:disabled]:bg-red-100 [&_.rdp-day_button:disabled]:text-red-500 [&_.rdp-day_button:disabled]:opacity-100 [&_.rdp-day_button:disabled]:line-through [&_.rdp-day_button:disabled]:cursor-not-allowed overflow-x-auto"
        >
          <DayPicker
            mode="single"
            disabled={[
              { before: new Date() }, // Disable past days
              ...disabledDays,
            ]}
            numberOfMonths={2}
            className="rdp-compact"
          />
        </div>
      )}
    </div>
  );
}
