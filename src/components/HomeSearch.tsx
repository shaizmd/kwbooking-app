"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import "react-day-picker/style.css";

interface HomeSearchProps {
  locale: string;
}

export default function HomeSearch({ locale }: HomeSearchProps) {
  const router = useRouter();
  
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState("2");
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

  const guestCount = parseInt(guests);

  const handleSearch = () => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams();
      params.set("checkIn", format(range.from, "yyyy-MM-dd"));
      params.set("checkOut", format(range.to, "yyyy-MM-dd"));
      params.set("guests", guests);
      router.push(`/${locale}/properties?${params.toString()}`);
      setShowCalendar(false);
    }
  };

  const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;

  return (
    <div className="w-full relative">
      {/* Pill-shaped Search Container */}
      <div className="bg-white rounded-full shadow-2xl p-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px_auto] gap-0 items-center">
          {/* Check-in */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="group relative px-6 py-4 text-left rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Check in</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {range?.from ? format(range.from, "MMM dd, yyyy") : "Add dates"}
              </span>
            </div>
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200"></div>
          </button>

          {/* Check-out */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="group relative px-6 py-4 text-left rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Check out</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {range?.to ? format(range.to, "MMM dd, yyyy") : "Add dates"}
              </span>
            </div>
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200"></div>
          </button>

          {/* Guests */}
          <button
            onClick={() => setShowCalendar(false)}
            className="group relative px-6 py-4 text-left rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Guests</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests(Math.max(1, guestCount - 1).toString());
                  }}
                  className="text-gray-500 hover:text-red-600 transition"
                  disabled={guestCount <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 min-w-[60px] text-center">
                  {guests} {guests === "1" ? 'guest' : 'guests'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests((guestCount + 1).toString());
                  }}
                  className="text-gray-500 hover:text-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!range?.from || !range?.to}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-full px-8 py-4 flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg disabled:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowCalendar(false)}
          ></div>
          
          {/* Calendar popup */}
          <div 
            className="fixed left-1/2 -translate-x-1/2 top-[280px] sm:top-[240px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 border border-gray-100 w-[min(95vw,680px)]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleDateSelect}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                className="rdp-compact"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}