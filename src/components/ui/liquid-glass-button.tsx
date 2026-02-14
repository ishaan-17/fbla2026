"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default: "text-earth-800",
        light: "text-white",
        dark: "text-white",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-10 px-6 text-sm",
        xl: "h-14 px-8 text-base",
        xxl: "h-14 px-10 text-base",
        full: "h-14 w-full px-10 text-base",
        icon: "size-9",
        search: "h-[46px] px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

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
  const isLight = variant === "light"
  const isLarge = size === "full" || size === "xxl" || size === "xl" || size === "search"
  const borderRadius = isLarge ? "rounded-2xl" : "rounded-full"

  const glassLayers = (
    <>
      {/* Main glass background */}
      <div
        className={cn(
          "absolute inset-0 z-0 overflow-hidden pointer-events-none",
          borderRadius
        )}
        style={{
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          background: isDark
            ? `linear-gradient(
                135deg,
                rgba(40, 40, 40, 0.4) 0%,
                rgba(20, 20, 20, 0.3) 50%,
                rgba(30, 30, 30, 0.35) 100%
              )`
            : isLight
              ? `linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.12) 0%,
                  rgba(255, 255, 255, 0.06) 50%,
                  rgba(255, 255, 255, 0.1) 100%
                )`
              : `linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 50%,
                  rgba(255, 255, 255, 0.08) 100%
                )`,
        }}
      />

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 z-[0] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          borderRadius
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
        }}
      />

      {/* Inner border glow - liquid glass style */}
      <div
        className={cn(
          "absolute inset-0 z-[1] pointer-events-none",
          borderRadius
        )}
        style={{
          boxShadow: isDark
            ? `
              inset 0 0 0 0.5px rgba(255, 255, 255, 0.08),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)
            `
            : `
              inset 0 0 0 0.5px rgba(255, 255, 255, 0.15),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.03)
            `,
        }}
      />

      {/* Outer shadow for depth */}
      <div
        className={cn(
          "absolute inset-0 z-[-1] pointer-events-none",
          borderRadius
        )}
        style={{
          boxShadow: isDark
            ? '0 4px 24px rgba(0, 0, 0, 0.25), 0 12px 48px rgba(0, 0, 0, 0.15)'
            : '0 4px 24px rgba(0, 0, 0, 0.08), 0 12px 48px rgba(0, 0, 0, 0.05)',
        }}
      />
    </>
  )

  const buttonClasses = cn(
    "relative",
    borderRadius,
    "hover:scale-[1.02] active:scale-[0.98]",
    liquidbuttonVariants({ variant, size, className })
  )

  // When asChild, wrap in a span container to hold the glass layers
  if (asChild) {
    return (
      <span className={cn("relative inline-flex group", borderRadius)}>
        {glassLayers}
        <Slot
          data-slot="button"
          className={cn(buttonClasses, "z-10")}
          {...props}
        >
          {children}
        </Slot>
      </span>
    )
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonClasses, "group")}
      {...props}
    >
      {glassLayers}
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  )
}

export { LiquidButton, liquidbuttonVariants }
export default LiquidButton
