"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { register, getCurrentUser } from "@/lib/auth/client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "HOST">("CUSTOMER");

  // Redirect if already logged in
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          router.push(`/${locale}`);
        }
      })
      .finally(() => setChecking(false));
  }, [router, locale]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    try {
      await register({ email, password, fullName, phone, role: selectedRole });
      router.push(`/${locale}/`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Animated Flowing Lines */}
      <div className="flowing-lines">
        <div className="flowing-line"></div>
        <div className="flowing-line"></div>
        <div className="flowing-line"></div>
      </div>

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3" style={{ color: 'var(--text-dark)' }}>
            Create your account
          </h1>
          <p className="subtext">
            Join our platform and start your journey today
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          className="bg-white rounded-xl p-8 shadow-sm border"
          style={{ borderColor: 'rgba(211, 47, 47, 0.1)' }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                className="border rounded-xl p-4 text-sm flex items-start gap-3"
                style={{ backgroundColor: '#fff5f5', borderColor: 'var(--red)', color: 'var(--red)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: '#e5e7eb',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  pattern="[0-9]{8,15}"
                  title="Enter 8 to 15 digits"
                  placeholder="Enter Mobile Number"
                  className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: '#e5e7eb',
                    fontSize: '16px'
                  }}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/\D/g, "").slice(0, 15);
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: '#e5e7eb',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: '#e5e7eb',
                  fontSize: '16px'
                }}
              />
              <p className="mt-2 text-xs subtext">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-dark)' }}>
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setSelectedRole("CUSTOMER")}
                  className="relative p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                  style={{ 
                    borderColor: selectedRole === "CUSTOMER" ? 'var(--red)' : '#e5e7eb',
                    backgroundColor: selectedRole === "CUSTOMER" ? 'rgba(211, 47, 47, 0.04)' : 'white'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: selectedRole === "CUSTOMER" ? 'var(--red)' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="text-left">
                    <span className="font-semi text-sm block" style={{ color: 'var(--text-dark)' }}>Book Properties</span>
                    <p className="text-xs mt-0.5" style={{ fontSize: '11px', color: 'rgb(107, 114, 128)' }}>Find and book your perfect stay</p>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setSelectedRole("HOST")}
                  className="relative p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                  style={{ 
                    borderColor: selectedRole === "HOST" ? 'var(--red)' : '#e5e7eb',
                    backgroundColor: selectedRole === "HOST" ? 'rgba(211, 47, 47, 0.04)' : 'white'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: selectedRole === "HOST" ? 'var(--red)' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-left">
                    <span className="font-semibold text-sm block" style={{ color: 'var(--text-dark)' }}>List Property</span>
                    <p className="text-xs mt-0.5" style={{ fontSize: '11px', color: 'rgb(107, 114, 128)' }}>Earn by hosting your place</p>
                  </div>
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-medium text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#d32f2f',
                color: 'white',
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="subtext">
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="font-semibold hover:underline" style={{ color: 'var(--red)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <p className="text-center mt-6 subtext text-sm">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
