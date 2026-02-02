"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function Footer() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-gray-300 border-t mt-auto" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--red)' }}>
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl text-white">BookStay</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-sm">
              {t("tagline")}
            </p>
            <p className="text-sm text-gray-500">
              {t("copyright", { year: currentYear })}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="transition hover-red">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/host`} className="transition hover-red">
                  {t("becomeHost")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/help`} className="transition hover-red">
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="transition hover-red">
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t("legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms`} className="transition hover-red">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="transition hover-red">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="transition hover-red">
                  {t("cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
