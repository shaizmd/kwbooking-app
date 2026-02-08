/* eslint-disable @next/next/no-page-custom-font */
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales, localeDirection, type Locale } from "@/config/locales";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import "../globals.css";


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={localeDirection[locale as Locale]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/geometria" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
