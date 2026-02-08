"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, differenceInDays } from "date-fns";

interface DateRangePickerProps {
  propertyId: string;
  locale: string;
  maxGuests?: number;
}

export default function DateRangePicker({
  propertyId,
  locale,
  maxGuests = 10,
}: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    if (checkIn && checkOut) {
      return { from: new Date(checkIn), to: new Date(checkOut) };
    }
    return undefined;
  });

  const [adults, setAdults] = useState(
    Number(searchParams.get("adults") || "2")
  );
  const [children, setChildren] = useState(
    Number(searchParams.get("children") || "0")
  );
  const [rooms, setRooms] = useState(
    Number(searchParams.get("rooms") || "1")
  );

  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (range?.from && range?.to) {
      if (selectedRange?.from) {
        setRange({ from: selectedRange.from, to: undefined });
      }
    } else {
      setRange(selectedRange);
    }
  };

  const totalGuests = adults + children;
  const isOverCapacity = maxGuests && totalGuests > maxGuests;

  const handleSearch = () => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams();
      params.set("checkIn", format(range.from, "yyyy-MM-dd"));
      params.set("checkOut", format(range.to, "yyyy-MM-dd"));
      params.set("adults", adults.toString());
      params.set("children", children.toString());
      params.set("rooms", rooms.toString());

      router.push(
        `/${locale}/properties/${propertyId}?${params.toString()}`
      );

      setShowCalendar(false);
    }
  };

  const nights =
    range?.from && range?.to
      ? differenceInDays(range.to, range.from)
      : 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 relative overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        {/* Check-in */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-in
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white text-sm"
          >
            {range?.from
              ? format(range.from, "MMM dd, yyyy")
              : "Add date"}
          </button>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-out
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white text-sm"
          >
            {range?.to
              ? format(range.to, "MMM dd, yyyy")
              : "Add date"}
          </button>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Guests
          </label>

          <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
            <button
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
            >
              −
            </button>

            <span className="flex-1 text-center text-sm font-semibold">
              {totalGuests}
            </span>

            <button
              onClick={() => setAdults(adults + 1)}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>

          {isOverCapacity && (
            <p className="text-xs text-orange-600 mt-1">
              Extra charges for {totalGuests - maxGuests} guest(s)
            </p>
          )}
        </div>

        {/* Search */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={!range?.from || !range?.to}
            className="w-full py-2 text-white font-semibold rounded-md disabled:opacity-50"
            style={{
              backgroundColor:
                range?.from && range?.to ? "var(--red)" : "#ccc",
            }}
          >
            {nights > 0 ? `Search (${nights}N)` : "Search"}
          </button>
        </div>
      </div>

      {/* CALENDAR POPUP */}
      {showCalendar && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowCalendar(false)}
          />

          {/* LEFT ANCHORED POPUP */}
          <div className="absolute top-full left-0 mt-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[780px] max-w-[95vw]">

              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleDateSelect}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                showOutsideDays
                fixedWeeks
              />

              <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                <button
                  onClick={() => {
                    setRange(undefined);
                    setShowCalendar(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Clear
                </button>

                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded"
                  disabled={!range?.from || !range?.to}
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
