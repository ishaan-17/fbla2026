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
        caption_label: "text-sm font-semibold text-earth-900",
        
        // Navigation - liquid glass style buttons
        nav: "absolute top-4 left-0 right-0 flex items-center justify-between px-2 z-10",
        button_previous: cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-full",
          "text-earth-700 hover:text-earth-900",
          "transition-all duration-200 hover:scale-105",
          // Liquid glass effect
          "bg-white/20",
          "shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.3),inset_0_0_4px_rgba(255,255,255,0.2)]",
          "hover:shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_1px_1px_3px_rgba(255,255,255,0.6),inset_-1px_-1px_3px_rgba(255,255,255,0.4),inset_0_0_6px_rgba(255,255,255,0.3)]"
        ),
        button_next: cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-full",
          "text-earth-700 hover:text-earth-900",
          "transition-all duration-200 hover:scale-105",
          // Liquid glass effect
          "bg-white/20",
          "shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.3),inset_0_0_4px_rgba(255,255,255,0.2)]",
          "hover:shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_1px_1px_3px_rgba(255,255,255,0.6),inset_-1px_-1px_3px_rgba(255,255,255,0.4),inset_0_0_6px_rgba(255,255,255,0.3)]"
        ),
        
        // Week header
        weekdays: "flex justify-between",
        weekday: "text-earth-500 w-9 font-medium text-xs text-center uppercase tracking-wide",
        
        // Days grid
        month_grid: "w-full border-collapse",
        weeks: "",
        week: "flex justify-between mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          "h-9 w-9 p-0 font-medium rounded-full transition-all duration-200",
          "text-earth-700",
          // Liquid glass hover effect
          "hover:bg-white/30 hover:text-earth-900 hover:scale-105",
          "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.3)]",
          "focus:outline-none focus:ring-2 focus:ring-earth-400/30",
          // Selected state - override text color to pure white
          "[&[aria-selected=true]]:!text-white [&[aria-selected=true]]:hover:!text-white"
        ),
        
        // Day states - selected has dark liquid glass
        selected: cn(
          "rounded-full font-semibold",
          // Dark liquid glass effect like the button
          "bg-[radial-gradient(ellipse_at_50%_0%,rgba(45,43,40,0.97)_0%,rgba(20,20,18,0.98)_100%)]",
          "shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_1px_1px_2px_rgba(255,255,255,0.12),inset_-1px_-1px_2px_rgba(255,255,255,0.06),inset_0_4px_8px_rgba(255,255,255,0.08)]",
          "hover:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)]",
          // Force white text on the button inside
          "[&>button]:!text-white [&>button]:hover:!text-white"
        ),
        today: cn(
          "text-earth-900 font-bold rounded-full",
          // Light liquid glass effect
          "bg-white/40",
          "shadow-[0_1px_6px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.4),inset_0_0_4px_rgba(255,255,255,0.3)]"
        ),
        outside: "text-earth-300 hover:text-earth-400",
        disabled: "text-earth-200 cursor-not-allowed hover:bg-transparent hover:shadow-none hover:scale-100",
        hidden: "invisible",
        range_start: "rounded-l-full",
        range_end: "rounded-r-full",
        range_middle: "bg-white/20 text-earth-800 rounded-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]",
        
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
