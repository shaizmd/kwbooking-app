"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PropertyFiltersProps {
  propertyTypes: string[];
  currentType?: string;
  currentSort?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function PropertyFilters({
  propertyTypes,
  currentType,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
}: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 sticky top-4">
      <h3 className="text-lg font-bold mb-4 text-gray-900">Filter by:</h3>
      
      <div className="space-y-6">
        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Property Type
          </label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
            value={currentType || "all"}
            onChange={(e) => updateSearchParams("type", e.target.value)}
          >
            <option value="all">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Your budget (per night)
          </label>
          <div className="space-y-3">
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
              placeholder="Min price (KWD)"
              defaultValue={currentMinPrice || ""}
              onBlur={(e) => updateSearchParams("minPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSearchParams("minPrice", e.currentTarget.value);
                }
              }}
            />
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
              placeholder="Max price (KWD)"
              defaultValue={currentMaxPrice || ""}
              onBlur={(e) => updateSearchParams("maxPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSearchParams("maxPrice", e.currentTarget.value);
                }
              }}
            />
          </div>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Sort By
          </label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
            value={currentSort || "featured"}
            onChange={(e) => updateSearchParams("sort", e.target.value)}
          >
            <option value="featured">Our top picks</option>
            <option value="price-low">Price (lowest first)</option>
            <option value="price-high">Price (highest first)</option>
            <option value="rating">Top reviewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
