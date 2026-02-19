"use client";
import React from "react";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Mail, Github, Search, Trophy, Users } from "lucide-react";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Navigate",
    links: [
      { title: "Browse Items", href: "/items" },
      { title: "Report Found", href: "/report" },
      { title: "Leaderboard", href: "/leaderboard" },
      { title: "About", href: "/about" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "How It Works", href: "/about" },
      { title: "30-Day Policy", href: "/about" },
      { title: "Admin Portal", href: "/admin" },
      { title: "Attribution", href: "/attribution" },
    ],
  },
  {
    label: "Features",
    links: [
      { title: "Search", href: "/items", icon: Search },
      { title: "Locations", href: "/items", icon: MapPin },
      { title: "Rewards", href: "/leaderboard", icon: Trophy },
      { title: "Community", href: "/leaderboard", icon: Users },
    ],
  },
];

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="relative w-full border-t border-white/10 bg-neutral-900 overflow-hidden px-6 py-12 lg:py-16"
    >
      {/* Blue glow effects like carousel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 rounded-full blur bg-primary-500/30" />

      <div className="grid w-full max-w-6xl mx-auto grid-cols-1 md:grid-cols-5 gap-8">
        <AnimatedContainer className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">
              Reclaimr
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Helping the Monta Vista community reunite with their belongings.
            Built with care for those who lose and those who find.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="#"
              aria-label="Email us"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Mail className="size-5" aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="View on GitHub"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Github className="size-5" aria-hidden="true" />
            </a>
          </div>
        </AnimatedContainer>

        {footerLinks.map((section, index) => (
          <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
            <nav aria-label={section.label}>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {section.label}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white inline-flex items-center transition-all duration-300"
                    >
                      {link.icon && (
                        <link.icon className="me-2 size-4 text-white/40" />
                      )}
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </AnimatedContainer>
        ))}
      </div>

      <AnimatedContainer delay={0.4} className="w-full max-w-6xl mx-auto">
        <div className="border-t border-white/10 mt-10 pt-6 w-full">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Reclaimr. Made for Monta Vista.
          </p>
        </div>
      </AnimatedContainer>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
