"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import "react-day-picker/style.css";

interface HomeSearchProps {
  locale: string;
}

type SavedHomeSearchState = {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
};

const HOME_SEARCH_STORAGE_KEY = "home_search_state_v1";

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number.parseInt(value, 10)
      : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function safeParseYmd(dateStr?: string) {
  if (!dateStr) return undefined;
  const d = parseISO(dateStr);
  return isValid(d) ? d : undefined;
}

export default function HomeSearch({ locale }: HomeSearchProps) {
  const router = useRouter();
  
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestsPalette, setShowGuestsPalette] = useState(false);

  // Load last used values (so going back/refresh doesn't reset to 2 guests).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HOME_SEARCH_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedHomeSearchState;

      const from = safeParseYmd(saved.checkIn);
      const to = safeParseYmd(saved.checkOut);
      if (from && to && to > from) {
        setRange({ from, to });
      }

      setAdults(clampInt(saved.adults, 1, 30, 2));
      setChildren(clampInt(saved.children, 0, 30, 0));
      setRooms(clampInt(saved.rooms, 1, 10, 1));
    } catch {
      // ignore
    }
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever user changes inputs.
  useEffect(() => {
    try {
      const payload: SavedHomeSearchState = {
        checkIn: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
        checkOut: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
        adults,
        children,
        rooms,
      };
      window.localStorage.setItem(HOME_SEARCH_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [range?.from, range?.to, adults, children, rooms]);

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

  const totalGuests = useMemo(() => adults + children, [adults, children]);

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

  return (
    <div className="w-full relative">
      {/* Pill-shaped Search Container */}
      <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-0 items-stretch">{/* Check-in */}
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowGuestsPalette(false);
            }}
            type="button"
            className="group relative px-4 md:px-6 py-3 md:py-4 text-left rounded-t-2xl md:rounded-l-full md:rounded-tr-none hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Check in</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {range?.from ? format(range.from, "MMM dd, yyyy") : "Add dates"}
              </span>
            </div>
          </button>

          {/* Check-out */}
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowGuestsPalette(false);
            }}
            type="button"
            className="group relative px-4 md:px-6 py-3 md:py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Check out</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {range?.to ? format(range.to, "MMM dd, yyyy") : "Add dates"}
              </span>
            </div>
          </button>

          {/* Guests - Updated */}
          <button
            onClick={() => {
              setShowGuestsPalette(!showGuestsPalette);
              setShowCalendar(false);
            }}
            type="button"
            className="group relative px-4 md:px-6 py-3 md:py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 md:border-r border-gray-100"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 mb-1">Travelers</span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}, {rooms} {rooms === 1 ? 'room' : 'rooms'}
              </span>
            </div>
          </button>

          {/* Search Button - Responsive */}
          <div className="mt-0 md:mt-0 md:-mr-2 md:-my-2 md:flex">
            <button
              onClick={handleSearch}
              disabled={!range?.from || !range?.to}
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-b-2xl md:rounded-none px-6 md:px-10 py-4 flex items-center justify-center gap-2.5 font-bold text-lg md:text-base transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:shadow-none cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
          </div>
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
            className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 border border-gray-100 w-full md:w-[min(95vw,680px)] max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6">
              <div className="[&_.rdp-months]:flex [&_.rdp-months]:flex-col [&_.rdp-months]:md:flex-row [&_.rdp-month:last-child]:hidden [&_.rdp-month:last-child]:md:block">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={handleDateSelect}
                  disabled={{ before: new Date() }}
                  numberOfMonths={2}
                  className="rdp-compact"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRange(undefined)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  disabled={!range?.from || !range?.to}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--red)" }}
                >
                  Done
                </button>
              </div>
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
            className="absolute left-0 md:right-0 md:left-auto top-full mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 border border-gray-100 w-full md:w-[min(90vw,360px)]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-red-600">Travelers</h3>
                <button 
                  onClick={() => setShowGuestsPalette(false)}
                  type="button"
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
                    onClick={() => setRooms((r) => Math.max(1, r - 1))}
                    disabled={rooms <= 1}
                    type="button"
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-6 text-center">{rooms}</span>
                  <button
                    onClick={() => setRooms((r) => Math.min(10, r + 1))}
                    disabled={rooms >= 10}
                    type="button"
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
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                    disabled={adults <= 1}
                    type="button"
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-6 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults((a) => Math.min(30, a + 1))}
                    disabled={adults >= 30}
                    type="button"
                    className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    disabled={children <= 0}
                    type="button"
                    className="w-9 h-9 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-6 text-center">{children}</span>
                  <button
                    onClick={() => setChildren((c) => Math.min(30, c + 1))}
                    disabled={children >= 30}
                    type="button"
                    className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                type="button"
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