import Link from "next/link";
import db from "@/lib/db";
import HeroShader from "@/components/HeroShader";
import { StatsSection } from "@/components/StatsSection";

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
      {/* Hero Section with Canvas Background - extends behind navbar */}
      <section className="relative h-[650px] overflow-hidden bg-earth-900 -mt-16 pt-16">
        {/* Canvas mouse trail effect */}
        <div className="absolute inset-0 z-0">
          <HeroShader />
        </div>
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/20 z-[1]" />
        {/* Hero content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
                {stats.activeListing} items currently listed
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                Lost something?
                <br />
                <span className="text-primary-300">We&apos;ll help.</span>
              </h1>
              <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
                Our school&apos;s lost and found platform makes it easy to report found items,
                search for your belongings, and earn rewards for helping.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-earth-900 text-sm font-bold tracking-wide hover:bg-white/90 transition-colors"
                >
                  Report Found Item
                </Link>
                <Link
                  href="/items"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-sm font-bold tracking-wide hover:bg-white hover:text-earth-900 transition-all"
                >
                  Search Lost Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats with animated gradients */}
      <StatsSection stats={stats} />

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-earth-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-earth-500 mt-3 max-w-md mx-auto">
            Three simple steps to help lost items find their owners
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Find an Item",
              desc: "Spot something that doesn't belong to you? Pick it up and bring it to safety.",
            },
            {
              step: "02",
              title: "Report It",
              desc: "Upload a photo and our AI will auto-categorize it. Fill in the details and submit.",
            },
            {
              step: "03",
              title: "Reunite & Earn",
              desc: "The owner claims it, admin verifies, and you earn points for being helpful!",
            },
          ].map((item, i) => (
            <div key={i} className="group">
              <p className="text-5xl font-extrabold text-earth-200 mb-4 group-hover:text-primary-300 transition-colors duration-300">
                {item.step}
              </p>
              <h3 className="text-lg font-bold text-earth-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-earth-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-earth-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Found something on campus?
            </h2>
            <p className="text-earth-400 mt-4 text-lg">
              Report it now and help someone get their belongings back. Earn
              points and climb the leaderboard!
            </p>
            <Link
              href="/report"
              className="inline-flex items-center mt-8 px-8 py-4 bg-white text-earth-900 text-sm font-bold tracking-wide hover:bg-earth-100 transition-colors"
            >
              Report an Item Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
