"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function HostCTA({ locale }: { locale: string }) {
  const t = useTranslations("home.hostCta");

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              backgroundColor: '#ffebee',
              border: '1px solid #ffcdd2',
              color: '#d32f2f',
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-sm">{t("becomeHost")}</span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-semibold mb-6 leading-tight" style={{ color: '#1a1a1a' }}>
            {t("title")}
          </h2>

          {/* Subtitle */}
          <p className="subtext max-w-2xl mx-auto mb-10">
            {t("subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base transition-all"
                style={{
                  backgroundColor: '#d32f2f',
                  color: 'white',
                }}
              >
                {t("becomeHost")}
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all"
                style={{
                  backgroundColor: 'white',
                  color: '#1a1a1a',
                  border: '2px solid #e5e7eb',
                }}
              >
                View Properties
              </Link>
            </motion.div>
          </div>

          {/* Benefits Text */}
          <p className="subtext">
            {t("features.verified")} • {t("features.secure")} • {t("features.support")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
