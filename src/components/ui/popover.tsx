"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

// SVG Filter for liquid glass distortion effect
const GlassFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter
        id="popover-glass-distortion"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.003 0.006"
          numOctaves="3"
          seed="7"
          result="turbulence"
        />
        <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blur" />
        <feSpecularLighting
          in="blur"
          surfaceScale="6"
          specularConstant="0.8"
          specularExponent="40"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="100" y="-100" z="200" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          in2="SourceGraphic"
          operator="in"
          result="specMask"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blur"
          scale="25"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feBlend in="specMask" in2="displaced" mode="screen" result="final" />
      </filter>
    </defs>
  </svg>
)

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <>
      <GlassFilter />
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 outline-none",
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {/* Liquid Glass Container */}
        <div 
          className="relative overflow-hidden rounded-3xl"
          style={{
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.15),
              0 2px 8px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.2)
            `,
          }}
        >
          {/* Glass distortion/blur layer */}
          <div
            className="absolute inset-0 z-0 rounded-3xl"
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              filter: "url(#popover-glass-distortion)",
            }}
          />
          
          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0 z-10 rounded-3xl"
            style={{ 
              background: `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.4) 0%,
                  rgba(255, 255, 255, 0.2) 50%,
                  rgba(255, 255, 255, 0.3) 100%
                )
              `,
            }}
          />
          
          {/* Inner edge highlights - top/left light, bottom/right subtle */}
          <div
            className="absolute inset-0 z-20 rounded-3xl pointer-events-none"
            style={{
              boxShadow: `
                inset 2px 2px 4px 0 rgba(255, 255, 255, 0.7),
                inset -1px -1px 3px 0 rgba(255, 255, 255, 0.4),
                inset 0 0 20px 0 rgba(255, 255, 255, 0.15)
              `,
            }}
          />
          
          {/* Subtle border */}
          <div
            className="absolute inset-0 z-25 rounded-3xl pointer-events-none"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          />
          
          {/* Content */}
          <div className="relative z-30">
            {children}
          </div>
        </div>
      </PopoverPrimitive.Content>
    </>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
