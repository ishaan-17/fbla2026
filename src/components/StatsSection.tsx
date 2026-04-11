"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";
import CountUp from "@/components/ui/count-up";

interface BentoCardProps {
  title: string;
  value: number;
  subtitle?: string;
  infoTooltip?: string;
  colors: string[];
  delay: number;
  direction?: "left" | "right";
  suffix?: string;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  infoTooltip,
  colors,
  delay,
  direction = "left",
  suffix = "",
}) => {
  const slideX = direction === "left" ? -120 : 120;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: delay + 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: slideX * 0.3 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-earth-900 min-h-[200px]"
      initial={{ opacity: 0, x: slideX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="heavy" />
      <motion.div
        className="relative z-10 p-6 sm:p-8 md:p-10 text-white"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.h3
          className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5"
          variants={item}
        >
          <span>{title}</span>
          {infoTooltip && (
            <span className="relative group/tooltip inline-flex">
              <span
                className="w-4 h-4 rounded-full border border-white/40 text-white/70 inline-flex items-center justify-center cursor-help"
                aria-label={infoTooltip}
              >
                <Info className="w-2.5 h-2.5" strokeWidth={2.5} />
              </span>
              <span className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 top-6 w-52 rounded-md border border-white/15 bg-earth-900/95 px-2.5 py-2 text-[11px] normal-case tracking-normal font-medium text-white/85 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150">
                {infoTooltip}
              </span>
            </span>
          )}
        </motion.h3>
        <motion.p
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mt-3 text-white"
          variants={item}
        >
          <CountUp
            from={0}
            to={value}
            separator=","
            direction="up"
            duration={1.5}
            delay={delay + 0.3}
            suffix={suffix}
          />
        </motion.p>
        {subtitle && (
          <motion.p
            className="text-sm text-white/60 mt-3 max-w-xs"
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

interface StatsSectionProps {
  stats: {
    totalReported: number;
    totalReturned: number;
    activeListing: number;
    onTimeReviewRate: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-earth-800">
        <div className="md:col-span-2">
          <BentoCard
            title="Items Reported"
            value={stats.totalReported}
            subtitle="Total items found and reported by the community"
            infoTooltip="Total number of found-item reports submitted on the platform."
            colors={["#6366f1", "#8b5cf6", "#a78bfa"]}
            delay={0.2}
            direction="left"
          />
        </div>
        <BentoCard
          title="Items Returned"
          value={stats.totalReturned}
          subtitle="Successfully reunited with owners"
          infoTooltip="Items confirmed as returned to their rightful owners."
          colors={["#14b8a6", "#2dd4bf", "#5eead4"]}
          delay={0.4}
          direction="right"
        />
        <BentoCard
          title="On-Time Reviews"
          value={stats.onTimeReviewRate}
          suffix="%"
          subtitle="Reports reviewed within 24 hours"
          infoTooltip="Percentage of submitted reports that were reviewed by admins within 24 hours."
          colors={["#f97316", "#fb923c", "#fdba74"]}
          delay={0.6}
          direction="left"
        />
        <div className="md:col-span-2">
          <BentoCard
            title="Active Listings"
            value={stats.activeListing}
            subtitle="Items currently waiting to be claimed"
            infoTooltip="Approved items that are currently visible and available on the Browse page."
            colors={["#ec4899", "#f472b6", "#f9a8d4"]}
            delay={0.8}
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}
