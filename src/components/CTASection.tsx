"use client";

import Link from "next/link";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  ScrollRevealStagger,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import ScrollFloat from "@/components/ui/scroll-float";

export function CTASection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient transition from previous section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-earth-900/50 to-earth-900" />

      {/* Background decorative orbs - matching HowItWorks aesthetic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[15%] w-80 h-80 bg-primary-500/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/8 rounded-full blur-3xl" />
        {/* Accent orb for warmth */}
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32">
        <ScrollRevealStagger
          className="max-w-2xl mx-auto text-center"
          staggerDelay={0.12}
        >
          {/* Badge/pill like HowItWorks section */}
          <ScrollRevealItem>
            <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Make a Difference
            </span>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              <ScrollFloat stagger={0.02}>
                Found something on campus?
              </ScrollFloat>
            </h2>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <p className="text-white/70 mt-5 text-lg leading-relaxed max-w-lg mx-auto">
              Report it now and help someone get their belongings back. Earn
              points and climb the leaderboard while making someone&apos;s day.
            </p>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <LiquidButton asChild variant="light" size="xl">
                <Link href="/report">Report an Item Now</Link>
              </LiquidButton>
              <LiquidButton asChild variant="dark" size="xl">
                <Link href="/leaderboard">View Leaderboard</Link>
              </LiquidButton>
            </div>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
