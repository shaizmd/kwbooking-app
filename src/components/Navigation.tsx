"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser, logout } from "@/lib/auth/client";
import type { User } from "@/lib/auth/client";
import LanguageToggle from "./LanguageToggle";
import { useTranslations } from "next-intl";

export function Navigation() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Logo */}
        <Link href="/" className="nav-logo-link">
          <div className="nav-logo-icon">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="nav-logo-text">BookStay</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {loading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              {/* Language Toggle */}
              <LanguageToggle />

              {user?.role === "HOST" && (
                <Link href="/host/properties/new" className="nav-btn">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("listProperty")}
                </Link>
              )}

              <Link href="/wishlist" className="nav-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t("wishlist")}
              </Link>

              <Link href="/bookings" className="nav-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t("myBookings")}
              </Link>

              {/* Account Dropdown */}
              <div className="nav-dropdown" ref={dropdownRef}>
                <button
                  className="nav-btn nav-account-btn"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user ? user.email.split('@')[0] : t("account")}
                  <svg 
                    className={`w-3 h-3 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAccountDropdown && (
                  <div className="dropdown-menu">
                    {user ? (
                      <>
                        {user.role === "HOST" && (
                          <Link 
                            href="/host" 
                            className="dropdown-item"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {t("hostDashboard")}
                          </Link>
                        )}
                        <Link 
                          href="/profile" 
                          className="dropdown-item"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t("manageAccount")}
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setShowAccountDropdown(false);
                          }} 
                          className="dropdown-item text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t("signOut")}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/login" 
                          className="dropdown-item"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          {tCommon("login")}
                        </Link>
                        <Link 
                          href="/register" 
                          className="dropdown-item"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          {t("signUp")}
                        </Link>
                        <div className="dropdown-divider"></div>
                        <Link 
                          href="/help" 
                          className="dropdown-item"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t("help")}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover-bg-red-light"
          style={{ color: 'var(--text-dark)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {/* Language Toggle for Mobile */}
          <div className="px-4 py-3 border-b border-gray-200">
            <LanguageToggle />
          </div>

          {user?.role === "HOST" && (
            <Link
              href="/host/properties/new"
              className="mobile-menu-item"
              onClick={() => setMenuOpen(false)}
            >
              {t("listProperty")}
            </Link>
          )}
          <Link
            href="/wishlist"
            className="mobile-menu-item"
            onClick={() => setMenuOpen(false)}
          >
            {t("wishlist")}
          </Link>
          <Link
            href="/bookings"
            className="mobile-menu-item"
            onClick={() => setMenuOpen(false)}
          >
            {t("myBookings")}
          </Link>
          
          <div className="dropdown-divider"></div>
          
          {user ? (
            <>
              <div className="px-4 py-2 text-sm text-gray-600">{user.email}</div>
              {user.role === "HOST" && (
                <Link
                  href="/host"
                  className="mobile-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("hostDashboard")}
                </Link>
              )}
              <Link
                href="/profile"
                className="mobile-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                {t("manageAccount")}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="mobile-menu-item text-red-600 w-full text-left"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mobile-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                {tCommon("login")}
              </Link>
              <Link
                href="/register"
                className="mobile-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                {t("signUp")}
              </Link>
              <Link
                href="/help"
                className="mobile-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                {t("help")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

