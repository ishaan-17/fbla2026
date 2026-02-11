"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default: "hover:scale-105 duration-300 transition text-earth-800",
        light: "hover:scale-105 duration-300 transition text-white",
        dark: "hover:scale-[1.02] duration-300 transition text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-10 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10",
        full: "h-14 w-full px-10",
        icon: "size-9",
        search: "h-[46px] px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="liquid-btn-glass"
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
  )
}

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean
}

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const isDark = variant === "dark"
  const isLarge = size === "full" || size === "xxl" || size === "xl" || size === "search"
  const borderRadius = isLarge ? "rounded-xl" : "rounded-full"

  const glassLayers = (
    <>
      {/* Backdrop blur layer */}
      <div
        className={cn("absolute inset-0 z-0 overflow-hidden pointer-events-none", borderRadius)}
        style={{
          backdropFilter: 'url("#liquid-btn-glass") blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

      {/* Dark background */}
      {isDark && (
        <div
          className={cn("absolute inset-0 z-[1] pointer-events-none", borderRadius)}
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(45, 43, 40, 0.97) 0%, rgba(20, 20, 18, 0.98) 100%)`,
          }}
        />
      )}

      {/* Main liquid glass effect - the key visual */}
      <div
        className={cn("absolute inset-0 z-[2] pointer-events-none", borderRadius)}
        style={{
          boxShadow: isDark
            ? `
              inset 0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 2px 2px 4px rgba(255, 255, 255, 0.12),
              inset -2px -2px 4px rgba(255, 255, 255, 0.08),
              inset 4px 4px 8px rgba(255, 255, 255, 0.06),
              inset -4px -4px 8px rgba(255, 255, 255, 0.04),
              inset 0 8px 16px rgba(255, 255, 255, 0.08),
              inset 0 -4px 12px rgba(0, 0, 0, 0.3)
            `
            : `
              inset 0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 2px 2px 4px rgba(255, 255, 255, 0.4),
              inset -2px -2px 4px rgba(255, 255, 255, 0.3),
              inset 0 4px 8px rgba(255, 255, 255, 0.2)
            `,
        }}
      />

      {/* Inner highlight ring - creates the shape inside */}
      <div
        className={cn("absolute z-[3] pointer-events-none", isLarge ? "rounded-[10px]" : "rounded-full")}
        style={{
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          boxShadow: isDark
            ? `
              inset 1px 1px 2px rgba(255, 255, 255, 0.15),
              inset -1px -1px 2px rgba(255, 255, 255, 0.08),
              inset 0 1px 3px rgba(255, 255, 255, 0.12)
            `
            : `
              inset 1px 1px 2px rgba(255, 255, 255, 0.6),
              inset -1px -1px 2px rgba(255, 255, 255, 0.4)
            `,
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '1px solid rgba(255, 255, 255, 0.3)',
        }}
      />

      {/* Top edge shine */}
      <div
        className={cn("absolute left-[10%] right-[10%] z-[4] pointer-events-none", isLarge ? "rounded-lg" : "rounded-full")}
        style={{
          top: '2px',
          height: isLarge ? '6px' : '4px',
          background: isDark
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
        }}
      />
    </>
  )

  const buttonClasses = cn(
    "relative",
    borderRadius,
    liquidbuttonVariants({ variant, size, className })
  )

  const buttonStyle = {
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.15)",
  }

  // When asChild, wrap in a span container to hold the glass layers
  if (asChild) {
    return (
      <>
        <GlassFilter />
        <span className={cn("relative inline-flex", borderRadius)} style={buttonStyle}>
          {glassLayers}
          <Slot
            data-slot="button"
            className={cn(buttonClasses, "z-10")}
            {...props}
          >
            {children}
          </Slot>
        </span>
      </>
    )
  }

  return (
    <>
      <GlassFilter />
      <button
        data-slot="button"
        className={buttonClasses}
        style={buttonStyle}
        {...props}
      >
        {glassLayers}
        {/* Content */}
        <span className="relative z-10">
          {children}
        </span>
      </button>
    </>
  )
}

export { LiquidButton, liquidbuttonVariants, GlassFilter }
export default LiquidButton
