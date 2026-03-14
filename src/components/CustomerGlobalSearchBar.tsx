"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/client";

const HIDDEN_SEGMENTS = new Set(["admin", "host", "login", "register", "403"]);

function shouldHideOnPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1 && (segments[0] === "en" || segments[0] === "ar")) {
    return true;
  }

  return segments.some((segment) => HIDDEN_SEGMENTS.has(segment));
}

export default function CustomerGlobalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"ADMIN" | "HOST" | "CUSTOMER" | null>(null);

  const isHidden = shouldHideOnPath(pathname);

  const locale = useMemo(() => {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    return firstSegment === "ar" || firstSegment === "en" ? firstSegment : "en";
  }, [pathname]);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setRole(user?.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  if (isHidden || role === "ADMIN" || role === "HOST") {
    return null;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const nextQuery = params.toString();
    const nextUrl = `/${locale}/properties${nextQuery ? `?${nextQuery}` : ""}`;
    router.push(nextUrl);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by location, place, area, property name"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              aria-label="Global property search"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-5 py-3 rounded-xl whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
