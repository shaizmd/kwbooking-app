"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { locales } from "@/config/locales";
import { useState } from "react";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0] || "en";

  const handleToggle = (locale: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Replace locale in path
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);

    // Preserve search params
    const search = searchParams.toString();
    const finalPath = search ? `${newPath}?${search}` : newPath;

    // Navigate to new locale
    router.push(finalPath);
    
    // Reset animation after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="language-toggle-container">
      <div className="language-toggle">
        <button
          className={`language-btn ${currentLocale === "en" ? "active" : ""}`}
          onClick={() => handleToggle("en")}
          disabled={currentLocale === "en" || isAnimating}
          aria-label="Switch to English"
        >
          EN
        </button>
        <div className="language-divider"></div>
        <button
          className={`language-btn ${currentLocale === "ar" ? "active" : ""}`}
          onClick={() => handleToggle("ar")}
          disabled={currentLocale === "ar" || isAnimating}
          aria-label="Switch to Arabic"
        >
          AR
        </button>
      </div>
    </div>
  );
}
