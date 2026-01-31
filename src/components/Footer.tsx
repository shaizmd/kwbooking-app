"use client";

export function Footer() {
  return (
    <footer className="text-gray-300 border-t mt-auto" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--red)' }}>
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl text-white">BookStay</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              Your trusted platform for booking verified properties in Kuwait and the MENA region.
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} BookStay. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="transition hover-red">
                  About Us
                </a>
              </li>
              <li>
                <a href="/host" className="transition hover-red">
                  Become a Host
                </a>
              </li>
              <li>
                <a href="/help" className="transition hover-red">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="transition hover-red">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="transition hover-red">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="transition hover-red">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookies" className="transition hover-red">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
