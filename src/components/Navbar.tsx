"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { SlideTabs } from "@/components/ui/slide-tabs";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { LogIn, LogOut } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

const navTabs = [
  { label: "Home", href: "/" },
  { label: "Report", href: "/report" },
  { label: "Browse", href: "/items" },
  // { label: "Donations", href: "/donations" }, // Temporarily hidden
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "/about" },
  { label: "Admin", href: "/admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const [isLightBackground, setIsLightBackground] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef(pathname);

  // Check admin status on mount and when pathname changes (e.g., after login redirect)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/claims");
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [pathname]);

  const detectBackgroundColor = useCallback(() => {
    if (!navRef.current) return;

    const rect = navRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Temporarily hide navbar to sample background
    const originalPointerEvents = navRef.current.style.pointerEvents;
    navRef.current.style.pointerEvents = "none";

    let element = document.elementFromPoint(x, y);

    navRef.current.style.pointerEvents = originalPointerEvents;

    // Traverse up the DOM to find a non-transparent background
    let foundColor = false;
    let r = 0,
      g = 0,
      b = 0,
      alpha = 0;

    while (element && element !== document.body && !foundColor) {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;

      // Parse rgba/rgb color
      const match = bgColor.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      );

      if (match) {
        const tempR = parseInt(match[1]);
        const tempG = parseInt(match[2]);
        const tempB = parseInt(match[3]);
        const tempAlpha = match[4] ? parseFloat(match[4]) : 1;

        if (tempAlpha > 0) {
          // Blend with previous color if semi-transparent
          if (alpha > 0) {
            r = Math.round(tempR * tempAlpha + r * (1 - tempAlpha));
            g = Math.round(tempG * tempAlpha + g * (1 - tempAlpha));
            b = Math.round(tempB * tempAlpha + b * (1 - tempAlpha));
            alpha = tempAlpha + alpha * (1 - tempAlpha);
          } else {
            r = tempR;
            g = tempG;
            b = tempB;
            alpha = tempAlpha;
          }

          // If we have a fully opaque color, we're done
          if (alpha >= 0.95) {
            foundColor = true;
          }
        }
      }

      element = element.parentElement;
    }

    // If we still don't have a color, default to dark background
    if (!foundColor && alpha < 0.1) {
      r = 0;
      g = 0;
      b = 0;
    }

    // Calculate relative luminance using proper sRGB conversion
    const toLinear = (c: number) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };

    const luminance =
      0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

    // If luminance is high (light background), use dark text
    setIsLightBackground(luminance > 0.5);
  }, []);

  // Reset background detection when page changes, and set up listeners
  useEffect(() => {
    // Reset on pathname change
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Schedule detection after paint so we sample the new page's background
      requestAnimationFrame(() => {
        detectBackgroundColor();
      });
    }

    // Delay initial detection to allow page content to render
    const timer = setTimeout(detectBackgroundColor, 100);

    window.addEventListener("scroll", detectBackgroundColor);
    window.addEventListener("resize", detectBackgroundColor);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", detectBackgroundColor);
      window.removeEventListener("resize", detectBackgroundColor);
    };
  }, [pathname, detectBackgroundColor]);

  const textColor = isLightBackground ? "text-black" : "text-white";
  const textColorSecondary = isLightBackground
    ? "text-black/80"
    : "text-white/80";
  const hamburgerColor = isLightBackground ? "bg-black" : "bg-white";

  // Filter tabs based on admin status
  const filteredTabs = navTabs.filter(
    (tab) => tab.label !== "Admin" || isAdmin,
  );

  // Helper function to truncate last name to initial
  const formatName = (name: string | null | undefined) => {
    if (!name) return "User";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  };

  return (
    <div
      ref={navRef}
      className="sticky top-5 z-50 w-90/100 md:w-11/12 2xl:w-4/6 mx-auto"
    >
      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          className={`
            lg:hidden fixed top-0 left-0 w-screen h-screen z-40 bg-black/45 backdrop-blur-md
            transition-opacity duration-300
            ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        aria-label="Main navigation"
        className="relative z-50 border border-white/8 bg-white/3 backdrop-blur-xl rounded-2xl"
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
              <span
                className={`text-xl font-extrabold tracking-tight transition-colors duration-200 ${textColor} lg:text-white`}
              >
                Reclaimr
              </span>
            </Link>

            {/* Desktop: Slide Tabs Navigation - Center (absolute for true center) */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
              <SlideTabs
                tabs={filteredTabs}
                isLightBackground={isLightBackground}
              />
            </div>

            {/* User Avatar or Login Button - Right */}
            <div className="hidden lg:flex">
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center justify-center gap-3">
                  <UserAvatar />
                  <span
                    className={`font-semibold transition-colors duration-200 ${textColorSecondary} lg:text-white/80`}
                  >
                    {formatName(session.user.name)}
                  </span>
                  <LiquidButton
                    variant="light"
                    size="sm"
                    onClick={async () => {
                      // Clear admin cookie as well
                      await fetch("/api/admin/auth", { method: "DELETE" });
                      setIsAdmin(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                  </LiquidButton>
                </div>
              ) : isAdmin ? (
                <LiquidButton
                  variant="light"
                  size="sm"
                  onClick={async () => {
                    await fetch("/api/admin/auth", { method: "DELETE" });
                    setIsAdmin(false);
                  }}
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                </LiquidButton>
              ) : (
                <LiquidButton variant="light" size="default" asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </LiquidButton>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 z-20"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <div
                className={`w-6 h-0.5 ${hamburgerColor} mb-1.5 transition-all duration-300 ${mobileOpen ? "transform rotate-45 translate-y-2" : ""}`}
              ></div>
              <div
                className={`w-6 h-0.5 ${hamburgerColor} mb-1.5 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
              ></div>
              <div
                className={`w-6 h-0.5 ${hamburgerColor} transition-all duration-300 ${mobileOpen ? "transform -rotate-45 -translate-y-2" : ""}`}
              ></div>
            </button>
          </div>

          {/* Mobile menu */}
          <div
            className={`
          lg:hidden fixed left-5 right-5 top-20 border border-white/8 bg-white/3 backdrop-blur-xl rounded-2xl
          transition-all duration-300 overflow-hidden
          ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
            style={{
              zIndex: 60,
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
            {/* Navigation links container with shared background */}
            <div className="relative p-4 overflow-hidden rounded-xl">
              {/* Links with borders */}
              <div className="relative z-10 flex flex-col">
                {filteredTabs.map((tab, index) => {
                  const isActive = pathname === tab.href;
                  const isFirst = index === 0;
                  const isLast = index === filteredTabs.length - 1;
                  return (
                    <div key={tab.href} className="relative group">
                      {/* Hover overlay */}
                      <div
                        className={`
                          absolute inset-0 z-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200

                        `}
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                        }}
                      />

                      <Link
                        href={tab.href}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          relative z-10 py-3 px-4 font-semibold text-base tracking-wide
                          transition-all duration-200 block rounded-xl
                          ${isActive ? "text-white bg-white/10" : "text-white/80"}
                          ${isFirst ? "rounded-t-xl" : ""}
                          ${isLast ? "rounded-b-xl" : ""}
                        `}
                      >
                        {tab.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Login/User section */}
            <div className="px-4 pb-4 mt-4">
              <div className="flex justify-center">
                {status === "loading" ? (
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                ) : session?.user ? (
                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar />
                      <span className="text-white/80 font-semibold">
                        {formatName(session.user.name)}
                      </span>
                    </div>
                    <LiquidButton
                      variant="light"
                      size="default"
                      onClick={async () => {
                        // Clear admin cookie as well
                        await fetch("/api/admin/auth", { method: "DELETE" });
                        setIsAdmin(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      aria-label="Sign out"
                      className=""
                    >
                      <div className={`flex items-center`}>
                        <LogOut className="w-4 h-4 mr-2 text-red-400" />
                        Sign Out
                      </div>
                    </LiquidButton>
                  </div>
                ) : isAdmin ? (
                  <LiquidButton
                    variant="light"
                    size="default"
                    onClick={async () => {
                      await fetch("/api/admin/auth", { method: "DELETE" });
                      setIsAdmin(false);
                    }}
                    aria-label="Sign out"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2 text-red-400" />
                      Sign Out
                    </div>
                  </LiquidButton>
                ) : (
                  <LiquidButton variant="light" size="lg" asChild>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </LiquidButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
