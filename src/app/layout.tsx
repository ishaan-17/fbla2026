import type { Metadata } from "next";
import { Nunito_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { Footer } from "@/components/ui/footer-section";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reclaimr — Lost & Found",
  description:
    "Help lost items find their way home. Report found items, search for your belongings, and earn rewards for helping others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SessionProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </SessionProvider>
        <Footer />
        {/*<footer className="border-t border-earth-200 bg-earth-900 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Reclaimr
                </span>
                <p className="text-sm text-earth-400 mt-3 leading-relaxed max-w-xs">
                  Helping our school community reunite with their belongings.
                  Built with care.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider mb-4">
                  Quick Links
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="/items"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    Browse Items
                  </a>
                  <a
                    href="/report"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    Report Found
                  </a>
                  <a
                    href="/leaderboard"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    Leaderboard
                  </a>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider mb-4">
                  Info
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="/about"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                  <a
                    href="/about"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    30-Day Policy
                  </a>
                  <a
                    href="/admin"
                    className="text-sm text-earth-300 hover:text-white transition-colors"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-earth-700 mt-10 pt-6">
              <p className="text-xs text-earth-500">
                &copy; 2025 Reclaimr. Made for our school community.
              </p>
            </div>
          </div>
        </footer>*/}
      </body>
    </html>
  );
}
