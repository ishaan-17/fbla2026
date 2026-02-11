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

// SVG Filter for subtle glass distortion
const GlassFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter
        id="tag-glass-distortion"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02 0.02"
          numOctaves="2"
          seed="3"
          result="turbulence"
        />
        <feGaussianBlur in="turbulence" stdDeviation="1" result="blur" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blur"
          scale="6"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
)

// Liquid Glass Tag Button Component
const GlassTagButton: React.FC<{
  tag: Tag
  layoutId: string
  onClick: () => void
  children: React.ReactNode
}> = ({ tag, layoutId, onClick, children }) => (
  <motion.button
    type="button"
    key={tag.id}
    layoutId={layoutId}
    className="relative overflow-hidden rounded-xl shrink-0 group"
    onClick={onClick}
    style={{
      boxShadow: `
        0 2px 8px rgba(0, 0, 0, 0.08),
        0 1px 3px rgba(0, 0, 0, 0.06)
      `,
    }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {/* Glass blur layer */}
    <div
      className="absolute inset-0 z-0 rounded-xl"
      style={{
        backdropFilter: "blur(8px) saturate(150%)",
        WebkitBackdropFilter: "blur(8px) saturate(150%)",
        filter: "url(#tag-glass-distortion)",
      }}
    />
    
    {/* Gradient overlay */}
    <div
      className="absolute inset-0 z-10 rounded-xl transition-all duration-200 group-hover:opacity-80"
      style={{
        background: `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.4) 100%
          )
        `,
      }}
    />
    
    {/* Inner highlights */}
    <div
      className="absolute inset-0 z-20 rounded-xl pointer-events-none"
      style={{
        boxShadow: `
          inset 1px 1px 2px 0 rgba(255, 255, 255, 0.8),
          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.4)
        `,
        border: "1px solid rgba(255, 255, 255, 0.5)",
      }}
    />
    
    {/* Content */}
    <div className="relative z-30 px-4 py-2">
      {children}
    </div>
  </motion.button>
)

// Selected tag with glass effect
const GlassSelectedTag: React.FC<{
  tag: Tag
  layoutId: string
  onRemove: () => void
}> = ({ tag, layoutId, onRemove }) => (
  <motion.div
    key={tag.id}
    className="relative overflow-hidden rounded-xl h-full shrink-0"
    layoutId={layoutId}
    style={{
      boxShadow: `
        0 2px 8px rgba(0, 0, 0, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.04)
      `,
    }}
  >
    {/* Glass blur layer */}
    <div
      className="absolute inset-0 z-0 rounded-xl"
      style={{
        backdropFilter: "blur(8px) saturate(150%)",
        WebkitBackdropFilter: "blur(8px) saturate(150%)",
        filter: "url(#tag-glass-distortion)",
      }}
    />
    
    {/* Gradient overlay - slightly tinted for selected state */}
    <div
      className="absolute inset-0 z-10 rounded-xl"
      style={{
        background: `
          linear-gradient(
            135deg,
            rgba(236, 253, 245, 0.7) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(236, 253, 245, 0.5) 100%
          )
        `,
      }}
    />
    
    {/* Inner highlights */}
    <div
      className="absolute inset-0 z-20 rounded-xl pointer-events-none"
      style={{
        boxShadow: `
          inset 1px 1px 2px 0 rgba(255, 255, 255, 0.9),
          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.5)
        `,
        border: "1px solid rgba(255, 255, 255, 0.6)",
      }}
    />
    
    {/* Content */}
    <div className="relative z-30 flex items-center gap-1 pl-3 pr-1 py-1 h-full">
      <motion.span
        layoutId={`tag-${tag.id}-label`}
        className="text-earth-700 font-medium text-sm"
      >
        {tag.label}
      </motion.span>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 hover:bg-white/50 transition-colors rounded-lg"
      >
        <X className="size-4 text-earth-500" />
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
      <GlassFilter />
      
      <motion.h2 layout className="text-sm font-bold text-earth-900 uppercase tracking-wider mb-3">
        {title}
      </motion.h2>
      
      {/* Selected tags container */}
      <motion.div
        className="w-full flex items-center justify-start gap-2 bg-earth-50/50 border border-earth-200 h-14 mb-3 overflow-x-auto p-1.5 no-scrollbar rounded-xl"
        ref={selectedsContainerRef}
        layout
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-earth-400 px-3">Click tags below to add them</span>
        ) : (
          selectedTags.map((tag) => (
            <GlassSelectedTag
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
            className="bg-earth-50/30 border border-earth-200 p-3 w-full rounded-xl"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <GlassTagButton
                  key={tag.id}
                  tag={tag}
                  layoutId={`tag-${tag.id}`}
                  onClick={() => addSelectedTag(tag)}
                >
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="text-earth-700 font-medium text-sm"
                  >
                    {tag.label}
                  </motion.span>
                </GlassTagButton>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
