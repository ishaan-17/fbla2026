"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

type Tag = {
  id: string
  label: string
}

type TagsSelectorProps = {
  tags: Tag[]
  selectedTags: Tag[]
  onSelectionChange: (tags: Tag[]) => void
  title?: string
}

// SVG Filter for liquid glass distortion
const LiquidGlassFilter: React.FC = () => (
  <svg className="hidden">
    <defs>
      <filter
        id="tag-liquid-glass"
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

// Liquid Glass Tag Button Component
const LiquidGlassTagButton: React.FC<{
  tag: Tag
  layoutId: string
  onClick: () => void
  children: React.ReactNode
}> = ({ tag, layoutId, onClick, children }) => (
  <motion.button
    type="button"
    key={tag.id}
    layoutId={layoutId}
    className="relative overflow-hidden rounded-xl shrink-0 group cursor-pointer"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
  >
    {/* Liquid glass shadow layer */}
    <div
      className="absolute top-0 left-0 z-0 h-full w-full rounded-xl transition-all"
      style={{
        boxShadow: `
          0 0 6px rgba(0,0,0,0.03),
          0 2px 6px rgba(0,0,0,0.08),
          inset 3px 3px 0.5px -3px rgba(0,0,0,0.9),
          inset -3px -3px 0.5px -3px rgba(0,0,0,0.85),
          inset 1px 1px 1px -0.5px rgba(0,0,0,0.6),
          inset -1px -1px 1px -0.5px rgba(0,0,0,0.6),
          inset 0 0 6px 6px rgba(0,0,0,0.12),
          inset 0 0 2px 2px rgba(0,0,0,0.06),
          0 0 12px rgba(255,255,255,0.15)
        `,
      }}
    />

    {/* Backdrop blur layer */}
    <div
      className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-xl"
      style={{ backdropFilter: 'url("#tag-liquid-glass")' }}
    />

    {/* Content */}
    <div className="relative z-10 px-4 py-2 pointer-events-none">
      {children}
    </div>
  </motion.button>
)

// Selected tag with liquid glass effect
const LiquidGlassSelectedTag: React.FC<{
  tag: Tag
  layoutId: string
  onRemove: () => void
}> = ({ tag, layoutId, onRemove }) => (
  <motion.div
    key={tag.id}
    className="relative overflow-hidden rounded-xl h-full shrink-0"
    layoutId={layoutId}
  >
    {/* Liquid glass shadow layer - with green tint for selected */}
    <div
      className="absolute top-0 left-0 z-0 h-full w-full rounded-xl transition-all"
      style={{
        boxShadow: `
          0 0 6px rgba(0,0,0,0.03),
          0 2px 6px rgba(0,0,0,0.08),
          inset 3px 3px 0.5px -3px rgba(34,197,94,0.9),
          inset -3px -3px 0.5px -3px rgba(34,197,94,0.85),
          inset 1px 1px 1px -0.5px rgba(34,197,94,0.6),
          inset -1px -1px 1px -0.5px rgba(34,197,94,0.6),
          inset 0 0 6px 6px rgba(34,197,94,0.12),
          inset 0 0 2px 2px rgba(34,197,94,0.06),
          0 0 12px rgba(34,197,94,0.15)
        `,
      }}
    />

    {/* Backdrop blur layer */}
    <div
      className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-xl"
      style={{ backdropFilter: 'url("#tag-liquid-glass")' }}
    />

    {/* Content */}
    <div className="relative z-10 flex items-center gap-1 pl-3 pr-1 py-1 h-full pointer-events-auto">
      <motion.span
        layoutId={`tag-${tag.id}-label`}
        className="text-white font-medium text-sm"
      >
        {tag.label}
      </motion.span>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 hover:bg-white/20 transition-colors rounded-lg"
      >
        <X className="size-4 text-white/70" />
      </button>
    </div>
  </motion.div>
)

export function TagsSelector({
  tags,
  selectedTags,
  onSelectionChange,
  title = "TAGS"
}: TagsSelectorProps) {
  const selectedsContainerRef = useRef<HTMLDivElement>(null)

  const removeSelectedTag = (id: string) => {
    onSelectionChange(selectedTags.filter((tag) => tag.id !== id))
  }

  const addSelectedTag = (tag: Tag) => {
    onSelectionChange([...selectedTags, tag])
  }

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      })
    }
  }, [selectedTags])

  const availableTags = tags.filter(
    (tag) => !selectedTags.some((selected) => selected.id === tag.id)
  )

  return (
    <div className="w-full flex flex-col">
      <LiquidGlassFilter />

      <motion.h2 layout className="text-sm font-bold text-white uppercase tracking-wider mb-3">
        {title}
      </motion.h2>

      {/* Selected tags container */}
      <motion.div
        className="w-full flex items-center justify-start gap-2 h-14 mb-3 overflow-x-auto p-1.5 no-scrollbar rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
        ref={selectedsContainerRef}
        layout
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-white/40 px-3">Click tags below to add them</span>
        ) : (
          selectedTags.map((tag) => (
            <LiquidGlassSelectedTag
              key={tag.id}
              tag={tag}
              layoutId={`tag-${tag.id}`}
              onRemove={() => removeSelectedTag(tag.id)}
            />
          ))
        )}
      </motion.div>

      {/* Available tags */}
      <AnimatePresence>
        {availableTags.length > 0 && (
          <motion.div
            className="p-3 w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <LiquidGlassTagButton
                  key={tag.id}
                  tag={tag}
                  layoutId={`tag-${tag.id}`}
                  onClick={() => addSelectedTag(tag)}
                >
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="text-white font-medium text-sm"
                  >
                    {tag.label}
                  </motion.span>
                </LiquidGlassTagButton>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
