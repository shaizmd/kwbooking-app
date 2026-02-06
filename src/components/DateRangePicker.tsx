"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  propertyId: string;
  locale: string;
  maxGuests?: number;
}

export default function DateRangePicker({ propertyId, locale, maxGuests = 10 }: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut)
      };
    }
    return undefined;
  });
  
  const [adults, setAdults] = useState(Number(searchParams.get("adults") || "2"));
  const [children, setChildren] = useState(Number(searchParams.get("children") || "0"));
  const [rooms, setRooms] = useState(Number(searchParams.get("rooms") || "1"));
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    // If we already have a complete range (both from and to), reset and start new selection
    if (range?.from && range?.to) {
      // Start fresh with only the new date as 'from'
      if (selectedRange?.from) {
        setRange({ from: selectedRange.from, to: undefined });
      }
    } else {
      // Normal behavior - building the range
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
      router.push(`/${locale}/properties/${propertyId}?${params.toString()}`);
      setShowCalendar(false);
    }
  };

  const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Check-in */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Check-in</label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition text-left bg-white text-sm"
          >
            {range?.from ? format(range.from, "MMM dd, yyyy") : "Add date"}
          </button>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 transition text-left bg-white text-sm"
          >
            {range?.to ? format(range.to, "MMM dd, yyyy") : "Add date"}
          </button>
        </div>

        {/* Guests */}
        <div>
          <label className=\"block text-xs font-semibold text-gray-600 mb-1\">Guests</label>
          <div className=\"flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white\">
            <button
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className=\"w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-sm font-bold\"
              disabled={adults <= 1}
            >
              −
            </button>
            <span className=\"flex-1 text-center text-sm font-semibold\">{totalGuests}</span>
            <button
              onClick={() => setAdults(adults + 1)}
              className=\"w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-sm font-bold\"
            >
              +
            </button>
          </div>
          {isOverCapacity && (
            <p className=\"text-xs text-orange-600 font-medium mt-1\">
              ⚠️ Extra charges for {totalGuests - maxGuests} guest(s)
            </p>
          )}
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={!range?.from || !range?.to}
            className="w-full py-2 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{ backgroundColor: (range?.from && range?.to) ? 'var(--red)' : '#ccc' }}
          >
            {nights > 0 ? `Search (${nights}N)` : 'Search'}
          </button>
        </div>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <>
          <div 
            className="fixed inset-0 bg-black z-40" 
            style={{ opacity: 0.3 }}
            onClick={() => setShowCalendar(false)}
          ></div>
          <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-2xl p-4 z-50" onClick={(e) => e.stopPropagation()}>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
              numberOfMonths={2}
              className="rdp-compact"
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
              <button
                onClick={() => {
                  setRange(undefined);
                  setShowCalendar(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded font-medium"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                disabled={!range?.from || !range?.to}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
