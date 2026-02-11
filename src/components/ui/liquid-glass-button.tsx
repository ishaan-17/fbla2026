// @ts-nocheck
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="navbar-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function LiquidGlassContainer({ children, className }: LiquidGlassContainerProps) {
  return (
    <>
      <GlassFilter />
      <div className={cn("relative", className)}>
        {/* Glass effect layer */}
        <div 
          className="absolute inset-0 -z-10 backdrop-blur-xl"
          style={{ backdropFilter: 'url("#navbar-glass") blur(12px)' }}
        />
        {/* Inner shadow/glow effects */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            boxShadow: `
              inset 2px 2px 4px 0 rgba(255, 255, 255, 0.1),
              inset -2px -2px 4px 0 rgba(255, 255, 255, 0.05),
              0 4px 30px rgba(0, 0, 0, 0.1)
            `
          }}
        />
        {children}
      </div>
    </>
  );
}

export function LiquidButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 px-6 py-2",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] 
      transition-all 
      dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]" />
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full backdrop-blur-xl"
      />
      <span className="pointer-events-none z-10">
        {children}
      </span>
    </button>
  )
}

export default LiquidGlassContainer;
