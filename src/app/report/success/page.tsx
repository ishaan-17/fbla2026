"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ConfettiCelebration } from "@/components/ui/confetti-celebration";
import { PointsCelebration } from "@/components/ui/points-celebration";
import { CheckCircle2, ArrowRight, Plus, Search } from "lucide-react";

export default function ReportSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti after a brief delay for dramatic effect
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 200);

    // Show content after celebration animation
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 1800);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] -mt-16 pt-16 overflow-hidden">
      {/* Confetti layer */}
      <ConfettiCelebration active={showConfetti} particleCount={100} duration={5000} />

      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.02) 40%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-16 pb-12 flex flex-col items-center">
        {/* Points celebration */}
        <div className="mb-10">
          <PointsCelebration
            points={10}
            message="Points Earned!"
            subMessage="Thank you for helping someone find their lost item"
          />
        </div>

        {/* Success card */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="w-full"
            >
              {/* Success message card */}
              <div className="relative mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-center mb-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-2xl font-bold text-white text-center mb-2"
                >
                  Report Submitted!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-white/60 text-center text-sm leading-relaxed"
                >
                  Your report is now under review. An admin will verify and publish it shortly.
                </motion.p>

                {/* Stats bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-6 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-white/50">Pending review</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">Est. time:</span>
                    <span className="text-white/80 font-medium">~24 hours</span>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center w-full"
              >
                <LiquidButton asChild variant="dark" size="lg" className="flex-1">
                  <Link href="/report" className="flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                    <Plus className="w-4 h-4" />
                    Report Another
                  </Link>
                </LiquidButton>
                <LiquidButton asChild variant="dark" size="lg" className="flex-1">
                  <Link href="/items" className="flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                    <Search className="w-4 h-4" />
                    Browse Items
                  </Link>
                </LiquidButton>
              </motion.div>

              {/* Leaderboard teaser */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-8"
              >
                <Link 
                  href="/leaderboard"
                  className="group flex items-center justify-center gap-2 text-sm text-white/40 hover:text-amber-400 transition-colors duration-200"
                >
                  <span>See where you rank on the leaderboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
