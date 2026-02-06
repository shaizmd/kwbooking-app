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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestsPalette, setShowGuestsPalette] = useState(false);

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

  const handleSearch = () => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams();
      params.set("checkIn", format(range.from, "yyyy-MM-dd"));
      params.set("checkOut", format(range.to, "yyyy-MM-dd"));
      params.set("adults", adults.toString());
      params.set("children", children.toString());
      params.set("rooms", rooms.toString());
      router.push(`/${locale}/properties?${params.toString()}`);
      setShowCalendar(false);
      setShowGuestsPalette(false);
    }
  };

  const handleApplyGuests = () => {
    setShowGuestsPalette(false);
  };

  const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;

  return (
    <div className="w-full relative">
      {/* Pill-shaped Search Container */}
      <div className="bg-white rounded-full shadow-2xl p-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px_auto] gap-0 items-stretch">
          {/* Check-in */}
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowGuestsPalette(false);
            }}
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
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowGuestsPalette(false);
            }}
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

          {/* Guests - Updated */}
          <button
            onClick={() => {
              setShowGuestsPalette(!showGuestsPalette);
              setShowCalendar(false);
            }}
            className="group relative px-6 py-4 text-left rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Travelers</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}, {rooms} {rooms === 1 ? 'room' : 'rooms'}
              </span>
            </div>
          </button>

          {/* Search Button - Half pill, half square */}
          <button
            onClick={handleSearch}
            disabled={!range?.from || !range?.to}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-r-full px-8 h-full flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg disabled:shadow-none cursor-pointer"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
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
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 border border-gray-100 w-[min(95vw,680px)]" 
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

      {/* Guests Palette Dropdown */}
      {showGuestsPalette && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowGuestsPalette(false)}
          ></div>
          
          {/* Guests palette popup */}
          <div 
            className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 border border-gray-100 w-[min(90vw,360px)]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-red-600">Travelers</h3>
                <button 
                  onClick={() => setShowGuestsPalette(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Rooms */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Rooms</div>
                  <div className="text-xs text-gray-500">Maximum 10 rooms</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-[24px] text-center">{rooms}</span>
                  <button
                    onClick={() => setRooms(Math.min(10, rooms + 1))}
                    disabled={rooms >= 10}
                    className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Adults</div>
                  <div className="text-xs text-gray-500">Age 13+</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-[24px] text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3 mb-5">
                <div>
                  <div className="text-sm font-medium text-gray-900">Children</div>
                  <div className="text-xs text-gray-500">Age 0-12</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-[24px] text-center">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyGuests}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}