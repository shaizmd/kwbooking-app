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
    <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
            Property Type
          </label>
          <select 
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
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

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
            Sort By
          </label>
          <select 
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            value={currentSort || "featured"}
            onChange={(e) => updateSearchParams("sort", e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
            Min Price (KWD)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            placeholder="Min"
            defaultValue={currentMinPrice || ""}
            onBlur={(e) => updateSearchParams("minPrice", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateSearchParams("minPrice", e.currentTarget.value);
              }
            }}
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
            Max Price (KWD)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            placeholder="Max"
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
    </div>
  );
}
