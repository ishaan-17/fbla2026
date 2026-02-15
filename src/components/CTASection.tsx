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
    <section className="bg-earth-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <ScrollRevealStagger
          className="max-w-2xl mx-auto text-center"
          staggerDelay={0.12}
        >
          <ScrollRevealItem>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              <ScrollFloat stagger={0.02}>
                Found something on campus?
              </ScrollFloat>
            </h2>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <p className="text-white/60 mt-4 text-lg">
              Report it now and help someone get their belongings back. Earn
              points and climb the leaderboard!
            </p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="mt-8 flex justify-center">
              <LiquidButton asChild variant="light" size="xl">
                <Link href="/report">Report an Item Now</Link>
              </LiquidButton>
            </div>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
