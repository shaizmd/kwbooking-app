"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
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

  const [guests, setGuests] = useState(searchParams.get("guests") || "2");
  const [showCalendar, setShowCalendar] = useState(false);

  const guestCount = Number(guests);
  const adults = guestCount;
  const children = 0;

  const totalGuests = adults + children;
  const isOverCapacity = maxGuests && totalGuests > maxGuests;

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (range?.from && range?.to) {
      if (selectedRange?.from) {
        setRange({ from: selectedRange.from, to: undefined });
      }
    } else {
      setRange(selectedRange);
    }
  };

  const handleSearch = () => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams();
      params.set("checkIn", format(range.from, "yyyy-MM-dd"));
      params.set("checkOut", format(range.to, "yyyy-MM-dd"));
      params.set("guests", guests);

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

      {/* SEARCH GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        {/* CHECK IN */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-in
          </label>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white text-sm"
          >
            {range?.from ? format(range.from, "MMM dd, yyyy") : "Add date"}
          </button>
        </div>

        {/* CHECK OUT */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check-out
          </label>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white text-sm"
          >
            {range?.to ? format(range.to, "MMM dd, yyyy") : "Add date"}
          </button>
        </div>

        {/* GUESTS */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Guests
          </label>

          <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">

            <button
              onClick={() =>
                setGuests(Math.max(1, guestCount - 1).toString())
              }
              disabled={guestCount <= 1}
              className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
            >
              −
            </button>

            <span className="flex-1 text-center text-sm font-semibold">
              {guests}
            </span>

            <button
              onClick={() => setGuests((guestCount + 1).toString())}
              className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
            >
              +
            </button>

          </div>

          {isOverCapacity && (
            <p className="text-xs text-orange-600 font-medium mt-1">
              ⚠ Extra charges for {guestCount - maxGuests} guest(s)
            </p>
          )}
        </div>

        {/* SEARCH BUTTON */}
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
          {/* OVERLAY */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowCalendar(false)}
          />

          {/* POPUP */}
          <div className="absolute top-full left-0 mt-4 z-50">

            <div className="bg-white rounded-xl shadow-2xl p-6 w-[760px] overflow-hidden">

              {/*  HARD LAYOUT FIX WRAPPER */}
              <div className="rdp-wrapper">

                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={handleDateSelect}
                  disabled={{ before: new Date() }}
                  numberOfMonths={2}
                  pagedNavigation
                  showOutsideDays
                  fixedWeeks
                />

              </div>

              {/* ACTIONS */}
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
                  disabled={!range?.from || !range?.to}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded"
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