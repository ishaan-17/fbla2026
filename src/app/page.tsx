import Link from "next/link";
import Image from "next/image";
import db from "@/lib/db";
import HeroShader from "@/components/HeroShader";
import { StatsSection } from "@/components/StatsSection";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { HowItWorks } from "@/components/HowItWorks";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import TextType from "@/components/TextType";
import GradientText from "@/components/GradientText";

export const dynamic = "force-dynamic";

export default function Home() {
  const stats = {
    totalReported: (
      db.prepare("SELECT COUNT(*) as c FROM items").get() as { c: number }
    ).c,
    totalReturned: (
      db
        .prepare("SELECT COUNT(*) as c FROM items WHERE status = 'claimed'")
        .get() as { c: number }
    ).c,
    activeListing: (
      db
        .prepare("SELECT COUNT(*) as c FROM items WHERE status = 'approved'")
        .get() as { c: number }
    ).c,
  };

  return (
    <div>
      {/* Hero Section with Image Background + Aurora Effect - extends behind navbar */}
      <section className="relative h-162.5 overflow-hidden bg-earth-900 -mt-16 pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-image.png"
            alt="Lost and Found Hero"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Aurora Effect Layer */}
        <div className="absolute inset-0 z-1 mix-blend-overlay">
          <AuroraBackground
            className="h-full w-full"
            showRadialGradient={false}
          >
            <></>
          </AuroraBackground>
        </div>

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-transparent z-[2]" />

        {/* Hero content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <ScrollRevealStagger className="max-w-2xl" staggerDelay={0.15}>
              <ScrollRevealItem>
                <p className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
                  {stats.activeListing} items currently listed
                </p>
              </ScrollRevealItem>
              <ScrollRevealItem>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  <span className="block min-h-[1.2em] text-white">
                    <TextType
                      text={["Lost something?", "Missing your keys?", "Can't find it?"]}
                      typingSpeed={70}
                      deletingSpeed={40}
                      pauseDuration={2000}
                      showCursor
                      cursorCharacter="_"
                      cursorBlinkDuration={0.5}
                      cursorClassName="text-primary-300 font-light"
                    />
                  </span>
                  <GradientText
                    colors={["#9fb3c8", "#d9e2ec", "#829ab1", "#bcccdc"]}
                    animationSpeed={5}
                  >
                    We&apos;ll help.
                  </GradientText>
                </h1>
              </ScrollRevealItem>
              <ScrollRevealItem>
                <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
                  Our school&apos;s lost and found platform makes it easy to
                  report found items, search for your belongings, and earn
                  rewards for helping.
                </p>
              </ScrollRevealItem>
              <ScrollRevealItem>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <LiquidButton asChild variant="light" size="xl">
                    <Link href="/report">Report Found Item</Link>
                  </LiquidButton>
                  <LiquidButton asChild variant="dark" size="xl">
                    <Link href="/items">Search Lost Items</Link>
                  </LiquidButton>
                </div>
              </ScrollRevealItem>
            </ScrollRevealStagger>
          </div>
        </div>
      </section>

      {/* Stats with animated gradients */}
      <StatsSection stats={stats} />

      {/* How It Works */}
      <HowItWorks />

      {/* CTA Section */}
      <section className="bg-earth-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <ScrollRevealStagger
            className="max-w-2xl mx-auto text-center"
            staggerDelay={0.12}
          >
            <ScrollRevealItem>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Found something on campus?
              </h2>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <p className="text-earth-400 mt-4 text-lg">
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
    </div>
  );
}
