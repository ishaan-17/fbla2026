'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsCelebrationProps {
  points?: number;
  message?: string;
  subMessage?: string;
  className?: string;
  onAnimationComplete?: () => void;
}

export function PointsCelebration({
  points = 10,
  message = "Points Earned!",
  subMessage = "Thank you for helping the community",
  className,
  onAnimationComplete,
}: PointsCelebrationProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const countRef = useRef<number>(0);

  // Animated counter
  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for satisfying count-up
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(eased * points);
      
      if (currentValue !== countRef.current) {
        countRef.current = currentValue;
        setDisplayPoints(currentValue);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setShowBurst(true);
        onAnimationComplete?.();
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [points, onAnimationComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={cn(
        "relative flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Outer glow ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute inset-0 -m-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Main card */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        {/* Trophy icon with animated ring */}
        <div className="relative mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.3,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="relative"
          >
            {/* Pulsing rings */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-amber-400/30"
              style={{ margin: -20 }}
            />
            <motion.div
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full bg-amber-400/20"
              style={{ margin: -30 }}
            />

            {/* Trophy container */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_40px_rgba(251,191,36,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)]">
              <Trophy className="w-12 h-12 text-amber-950" strokeWidth={1.5} />
              
              {/* Shine effect */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '200%', opacity: [0, 1, 0] }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
              />
            </div>
          </motion.div>

          {/* Floating sparkles */}
          <AnimatePresence>
            {showBurst && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 1,
                    }}
                    animate={{ 
                      scale: [0, 1.2, 0],
                      x: Math.cos((i / 6) * Math.PI * 2) * 60,
                      y: Math.sin((i / 6) * Math.PI * 2) * 60,
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Star 
                      className="w-4 h-4 text-amber-400" 
                      fill="currentColor"
                    />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Points display */}
        <motion.div
          className="flex items-center gap-2 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <motion.span
            key={displayPoints}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-6xl font-black tracking-tight bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent"
            style={{
              textShadow: '0 4px 20px rgba(251,191,36,0.3)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            +{displayPoints}
          </motion.span>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              {message}
            </h2>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm text-white/60">
            {subMessage}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
