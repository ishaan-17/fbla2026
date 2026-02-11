"use client"

import React from "react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg"

interface BentoCardProps {
  title: string
  value: string | number
  subtitle?: string
  colors: string[]
  delay: number
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  colors,
  delay,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-earth-900 min-h-[200px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="heavy" />
      <motion.div
        className="relative z-10 p-6 sm:p-8 md:p-10 text-white"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h3 
          className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wider" 
          variants={item}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mt-3 text-white"
          variants={item}
        >
          {value}
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
  )
}

interface StatsSectionProps {
  stats: {
    totalReported: number
    totalReturned: number
    activeListing: number
  }
}

export function StatsSection({ stats }: StatsSectionProps) {
  const returnRate = stats.totalReported > 0 
    ? Math.round((stats.totalReturned / stats.totalReported) * 100) 
    : 0

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-earth-800">
        <div className="md:col-span-2">
          <BentoCard
            title="Items Reported"
            value={stats.totalReported}
            subtitle="Total items found and reported by the community"
            colors={["#6366f1", "#8b5cf6", "#a78bfa"]}
            delay={0.2}
          />
        </div>
        <BentoCard
          title="Items Returned"
          value={stats.totalReturned}
          subtitle="Successfully reunited with owners"
          colors={["#14b8a6", "#2dd4bf", "#5eead4"]}
          delay={0.4}
        />
        <BentoCard
          title="Return Rate"
          value={`${returnRate}%`}
          subtitle="Items successfully returned to owners"
          colors={["#f97316", "#fb923c", "#fdba74"]}
          delay={0.6}
        />
        <div className="md:col-span-2">
          <BentoCard
            title="Active Listings"
            value={stats.activeListing}
            subtitle="Items currently waiting to be claimed"
            colors={["#ec4899", "#f472b6", "#f9a8d4"]}
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
}
