"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        // Root container needs relative for absolute nav buttons
        root: "relative",
        
        // Layout
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center items-center h-9 relative",
        caption_label: "text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",

        // Navigation - liquid glass style buttons
        nav: "absolute top-4 left-0 right-0 flex items-center justify-between px-2 z-10",
        button_previous: cn(
          "h-8 w-8 inline-flex items-center justify-center rounded-full",
          "text-white hover:text-white",
          "transition-all duration-200 hover:scale-105",
          // Liquid glass effect - darker for better contrast
          "bg-black/25 backdrop-blur-sm",
          "shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.15),inset_-1px_-1px_2px_rgba(255,255,255,0.08)]",
          "hover:bg-black/35 hover:shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.1)]"
        ),
        button_next: cn(
          "h-8 w-8 inline-flex items-center justify-center rounded-full",
          "text-white hover:text-white",
          "transition-all duration-200 hover:scale-105",
          // Liquid glass effect - darker for better contrast
          "bg-black/25 backdrop-blur-sm",
          "shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.15),inset_-1px_-1px_2px_rgba(255,255,255,0.08)]",
          "hover:bg-black/35 hover:shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.1)]"
        ),

        // Week header
        weekdays: "flex justify-between",
        weekday: "text-white/70 w-9 font-semibold text-xs text-center uppercase tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
        
        // Days grid
        month_grid: "w-full border-collapse",
        weeks: "",
        week: "flex justify-between mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          "h-9 w-9 p-0 font-semibold rounded-full transition-all duration-200",
          "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
          // Liquid glass hover effect
          "hover:bg-white/20 hover:text-white hover:scale-105",
          "hover:shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]",
          "focus:outline-none focus:ring-2 focus:ring-white/30",
          // Selected state - bright text for contrast
          "[&[aria-selected=true]]:!text-blue-400 [&[aria-selected=true]]:hover:!text-blue-300 [&[aria-selected=true]]:drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        ),

        // Day states - selected has dark liquid glass
        selected: cn(
          "rounded-full font-semibold",
          // Dark liquid glass effect
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(30,30,28,0.95)_0%,rgba(15,15,14,0.98)_100%)]",
          "shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05),inset_0_4px_8px_rgba(255,255,255,0.06)]",
          "hover:shadow-[0_2px_16px_rgba(0,0,0,0.4),inset_1px_1px_3px_rgba(255,255,255,0.12),inset_-1px_-1px_3px_rgba(255,255,255,0.06)]",
          // Bright amber text for maximum contrast
          "[&>button]:!text-blue-400 [&>button]:hover:!text-blue-300"
        ),
        today: cn(
          "font-bold rounded-full",
          // Light liquid glass effect with accent (only when not selected)
          "[&:not([data-selected])]:bg-white/25",
          "[&:not([data-selected])]:shadow-[0_1px_6px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,0.25),inset_-1px_-1px_2px_rgba(255,255,255,0.15),inset_0_0_4px_rgba(255,255,255,0.1)]",
          // White text with stronger shadow when NOT selected
          "[&:not([data-selected])>button]:!text-white [&:not([data-selected])>button]:!drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
          "[&[data-selected]>button]:!text-blue-400"
        ),
        outside: "[&>button]:text-white/30 [&>button]:hover:text-white/50 [&>button]:drop-shadow-none",
        disabled: "text-white/20 cursor-not-allowed hover:bg-transparent hover:shadow-none hover:scale-100",
        hidden: "invisible",
        range_start: "rounded-l-full",
        range_end: "rounded-r-full",
        range_middle: "bg-white/15 text-white rounded-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]",
        
        // Custom overrides
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
