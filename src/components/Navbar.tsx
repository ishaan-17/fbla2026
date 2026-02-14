"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SlideTabs } from "@/components/ui/slide-tabs";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { LogIn } from "lucide-react";
const navTabs = [
  { label: "Home", href: "/" },
  { label: "Report", href: "/report" },
  { label: "Browse", href: "/items" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "/about" },
  { label: "Admin", href: "/admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-5 mx-5 z-50 border border-white/8 bg-white/3 backdrop-blur-xl rounded-2xl"
      style={{
        boxShadow: `
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.03),
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.06)
          `,
        background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.05) 0%,
              rgba(255, 255, 255, 0.02) 50%,
              rgba(255, 255, 255, 0.04) 100%
            )
          `,
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">
              Reclaimr
            </span>
          </Link>

          {/* Desktop: Slide Tabs Navigation - Center (absolute for true center) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <SlideTabs tabs={navTabs} />
          </div>

          {/* Login Button - Right */}
          <div className="hidden md:flex">
            <LiquidButton variant="light" size="default" asChild>
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </LiquidButton>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 z-20"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <div
              className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileOpen ? "transform rotate-45 translate-y-2" : ""}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "transform -rotate-45 -translate-y-2" : ""}`}
            ></div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`
          md:hidden fixed inset-x-0 top-16 bg-earth-100 border-b border-earth-200
          transition-all duration-300 overflow-hidden
          ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
        >
          <div className="flex flex-col p-4 space-y-1">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    py-3 px-4 font-semibold text-base tracking-wide transition-colors
                    ${
                      isActive
                        ? "text-white bg-earth-900 rounded-lg"
                        : "text-earth-600 hover:text-earth-900 hover:bg-earth-100 rounded-lg"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
            <div className="pt-3 flex justify-center">
              <LiquidButton variant="light" size="lg" asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
