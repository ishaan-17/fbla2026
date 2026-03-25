"use client";

import { Sparkles } from "@/components/ui/sparkles";
import { IconCloud } from "@/components/ui/interactive-icon-cloud";

interface DonationsHeroProps {
  totalDonated: number;
  totalCategories: number;
}

// Nonprofit, education, and social-good orgs (valid Simple Icons slugs)
const charitySlugs = [
  "opencollective",
  "liberapay",
  "internetarchive",
  "openstreetmap",
  "exercism",
  "opensourceinitiative",
  "creativecommons",
  "letsencrypt",
  "mozilla",
  "signal",
  "tor",
  "goodreads",
];

export default function DonationsHero({
  totalDonated,
  totalCategories,
}: DonationsHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Main content area - two column on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: text + stats */}
          <div className="relative z-10 text-center lg:text-left items-center lg:items-start flex flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400/70 mb-3">
              Community Impact
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Every Item Finds
              <br />
              <span className="text-primary-400">A Second Purpose</span>
            </h1>
            <p className="text-white/50 mt-5 text-base leading-relaxed max-w-lg">
              Items unclaimed after 30 days are donated to local charities and
              organizations dedicated to serving those in need. Nothing goes to
              waste.
            </p>

            {/* Stats bar */}
            <div className="mt-10 flex flex-wrap gap-8 justify-center lg:justify-start">
              <Stat value={totalDonated} label="Items donated" />
              <div className="w-px h-12 bg-white/10" />
              <Stat value={30} label="Day holding period" />
              <div className="w-px h-12 bg-white/10" />
              <Stat value={totalCategories} label="Categories" />
            </div>
          </div>

          {/* Right: icon cloud */}
          <div className="relative flex items-center justify-center">
            {/* Soft ambient glow behind the cloud */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(130,154,177,0.08)_0%,transparent_70%)]" />
            <div className="relative w-full max-w-md mx-auto">
              <IconCloud iconSlugs={charitySlugs} />
            </div>
          </div>
        </div>
      </div>

      {/* Sparkles effect anchored at the bottom */}
      <div className="relative -mt-32 h-48 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        {/* Radial glow */}
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#627d98,transparent_70%)] before:opacity-20" />

        {/* Straight horizon line */}
        <div className="absolute left-0 right-0 top-1/2 z-10 h-1/2 border-t border-white/10 bg-[#121212]" />

        {/* Particles */}
        <Sparkles
          density={1200}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          color="#829ab1"
          size={1.2}
          speed={0.8}
        />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-white tabular-nums">
        {value}
      </p>
      <p className="text-xs text-white/40 font-medium uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
