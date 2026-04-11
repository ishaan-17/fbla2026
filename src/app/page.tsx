import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
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
import { CTASection } from "@/components/CTASection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reclaimr — School Lost & Found Platform",
  description:
    "Help lost items find their way home. Report found items, search for your belongings, and earn rewards for helping others at Monta Vista.",
};

export default async function Home() {
  const supabase = await createServiceClient();

  // Real active listings from Supabase
  const { count: approvedCount } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");
  const activeListings = approvedCount || 0;

  // Demo-friendly historical returns (intentionally fixed)
  const DEMO_RETURNED_ITEMS = 12;
  const returnedItems = DEMO_RETURNED_ITEMS;
  const reportedItems = activeListings + returnedItems;

  const stats = {
    totalReported: reportedItems,
    totalReturned: returnedItems,
    activeListing: activeListings,
    onTimeReviewRate: 93,
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
                      text={[
                        "Lost something?",
                        "Missing your keys?",
                        "Can't find it?",
                      ]}
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
                  Monta Vista High School&apos;s lost and found platform makes 
                  it easy to report found items, search for your belongings, 
                  and earn rewards for helping.
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
      <CTASection />
    </div>
  );
}
