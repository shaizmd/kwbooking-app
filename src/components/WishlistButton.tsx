"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/[locale]/wishlist/actions";

interface WishlistButtonProps {
  propertyId: string;
  locale: string;
  isInWishlist: boolean;
}

export default function WishlistButton({
  propertyId,
  locale,
  isInWishlist: initialIsInWishlist,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("locale", locale);

      try {
        await toggleWishlist(formData);
        setIsInWishlist(!isInWishlist);
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="absolute top-3 right-3 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all disabled:opacity-50"
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className="w-5 h-5 transition-colors"
        style={{ color: isInWishlist ? 'var(--red)' : 'var(--text-muted)' }}
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
