import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HeroSection, FeatureCard } from "@/components/animations/HomeAnimations";
import { HostCTA } from "@/components/HostCTA";
import HomeSearch from "@/components/HomeSearch";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Modern with Image */}
      <section className="relative min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] flex items-center justify-center pt-10 sm:pt-14 lg:pt-16 pb-20 sm:pb-32 lg:pb-40">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop"
            alt="Modern home interior"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/30"></div>
        </div>
        
        {/* Glassmorphic Content Container */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroSection>
            <div className="max-w-4xl mx-auto text-center">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2 sm:mb-3 bg-white border border-white/60 mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] sm:text-xs font-semibold text-black">{t("hero.badge")}</span>
                </div>

                {/* Main Headline - Prominent */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 tracking-tight text-white leading-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
                  {t("hero.title")}
                </h1>

                {/* Subheadline - Stronger */}
                <p className="text-sm sm:text-base lg:text-lg text-white/90 font-semibold mb-4 sm:mb-5 max-w-2xl mx-auto drop-shadow-[0_3px_14px_rgba(0,0,0,0.4)]">
                  {t("hero.subtitle")}
                </p>

                {/* Search Box - Hero element with glassmorphic background */}
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <div className="w-full max-w-4xl">
                    <HomeSearch locale={locale} />
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link
                    href={`/${locale}/properties`}
                    className="group w-full sm:w-auto px-6 py-2.5 text-sm rounded-full font-semibold transition-all border drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                    style={{
                      background: "linear-gradient(135deg, rgba(198, 40, 40, 0.95) 0%, rgba(183, 28, 28, 0.95) 100%)",
                      color: "white",
                      borderColor: "rgba(255, 255, 255, 0.25)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Browse all properties
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href={`/${locale}/host/properties/new`}
                    className="group w-full sm:w-auto px-6 py-2.5 text-sm rounded-full font-semibold transition-all border drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                    style={{
                      background: "white",
                      color: "#111111",
                      borderColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      List your property
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </HeroSection>
          </div>
        </div>

      </section>

      {/* Features Section - Card-based modern layout */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t("features.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Verified Properties */}
            <FeatureCard index={0}>
            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              
              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.verified.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.verified.description")}
              </p>
            </div>
            </FeatureCard>

            {/* Best Prices */}
            <FeatureCard index={1}>
            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.pricing.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.pricing.description")}
              </p>
            </div>
            </FeatureCard>

            {/* 24/7 Support */}
            <FeatureCard index={2}>
            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.support.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.support.description")}
              </p>
            </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Host CTA Section */}
      <HostCTA locale={locale} />
    </main>
  );
}