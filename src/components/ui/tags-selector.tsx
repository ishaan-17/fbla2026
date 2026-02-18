"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Plus } from "lucide-react"

type Tag = {
  id: string
  label: string
  category?: "color" | "size" | "material" | "type" | "other"
}

type TagsSelectorProps = {
  tags: Tag[]
  selectedTags: Tag[]
  onSelectionChange: (tags: Tag[]) => void
  title?: string
}

// Get solid color based on category
const getCategoryColor = (category?: string) => {
  switch (category) {
    case "color": return "rgba(139, 92, 246, 0.55)" // violet
    case "size": return "rgba(245, 158, 11, 0.55)" // amber
    case "material": return "rgba(6, 182, 212, 0.55)" // cyan
    case "type": return "rgba(244, 63, 94, 0.55)" // rose
    default: return "rgba(255, 255, 255, 0.15)" // neutral
  }
}

// Liquid Glass Layers with solid color
const GlassLayers: React.FC<{ color?: string }> = ({ color = "rgba(255, 255, 255, 0.15)" }) => (
  <>
    {/* Solid color background with blur */}
    <div
      className="absolute inset-0 z-0 rounded-xl pointer-events-none"
      style={{
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        background: color,
      }}
    />
    {/* Inner glow border */}
    <div
      className="absolute inset-0 z-[1] rounded-xl pointer-events-none"
      style={{
        boxShadow: `
          inset 0 0 0 0.5px rgba(255, 255, 255, 0.25),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)
        `,
      }}
    />
    {/* Outer shadow */}
    <div
      className="absolute inset-0 z-[-1] rounded-xl pointer-events-none"
      style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    />
    {/* Hover highlight */}
    <div
      className="absolute inset-0 z-[2] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      style={{ background: 'rgba(255, 255, 255, 0.15)' }}
    />
  </>
)

// Tag Button
const TagButton: React.FC<{ tag: Tag; onClick: () => void }> = ({ tag, onClick }) => (
  <motion.button
    type="button"
    className="group relative rounded-xl shrink-0 cursor-pointer h-9 px-4 flex items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
    whileTap={{ scale: 0.98 }}
  >
    <GlassLayers color={getCategoryColor(tag.category)} />
    <span className="relative z-10 text-white font-medium text-sm">{tag.label}</span>
  </motion.button>
)

// Create Tag Button
const CreateTagButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <motion.button
    type="button"
    className="group relative rounded-xl shrink-0 cursor-pointer h-9 px-4 flex items-center gap-1.5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
    whileTap={{ scale: 0.98 }}
  >
    <GlassLayers color="rgba(52, 211, 153, 0.55)" />
    <Plus className="relative z-10 size-3.5 text-emerald-400" />
    <span className="relative z-10 text-white font-medium text-sm">{label}</span>
  </motion.button>
)

// Selected Tag
const SelectedTag: React.FC<{ tag: Tag; onRemove: () => void }> = ({ tag, onRemove }) => (
  <motion.div
    className="group relative rounded-xl shrink-0 h-9 flex items-center gap-1.5 pl-4 pr-2"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
  >
    <GlassLayers color="rgba(59, 130, 246, 0.55)" />
    <span className="relative z-10 text-white font-medium text-sm">{tag.label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="relative z-10 p-1 hover:bg-white/20 transition-colors duration-200 rounded-lg"
    >
      <X className="size-3.5 text-white/80" />
    </button>
  </motion.div>
)

export function TagsSelector({
  tags,
  selectedTags,
  onSelectionChange,
  title = "TAGS"
}: TagsSelectorProps) {
  const selectedsContainerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const removeSelectedTag = (id: string) => {
    onSelectionChange(selectedTags.filter((tag) => tag.id !== id))
  }

  const addSelectedTag = (tag: Tag) => {
    onSelectionChange([...selectedTags, tag])
    setSearchQuery("")
  }

  const createCustomTag = (label: string) => {
    const newTag: Tag = {
      id: `custom-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      label: label.trim()
    }
    onSelectionChange([...selectedTags, newTag])
    setSearchQuery("")
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

  const filteredTags = searchQuery
    ? availableTags.filter((tag) =>
        tag.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTags

  const queryMatchesExistingTag = searchQuery && (
    tags.some((tag) => tag.label.toLowerCase() === searchQuery.toLowerCase().trim()) ||
    selectedTags.some((tag) => tag.label.toLowerCase() === searchQuery.toLowerCase().trim())
  )

  const showCreateButton = searchQuery.trim() && !queryMatchesExistingTag

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
        {title}
      </h2>

      {/* Selected tags container */}
      <div
        className="w-full flex items-center justify-start gap-2 min-h-[3rem] mb-3 overflow-x-auto p-2 no-scrollbar rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
        ref={selectedsContainerRef}
      >
        <AnimatePresence mode="popLayout">
          {selectedTags.length === 0 ? (
            <span className="text-sm text-white/40 px-2">Click tags below to add them</span>
          ) : (
            selectedTags.map((tag) => (
              <SelectedTag
                key={tag.id}
                tag={tag}
                onRemove={() => removeSelectedTag(tag.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Search and available tags */}
      <div className="p-3 w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or create a tag..."
            className="w-full pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 bg-black/20 rounded-xl border border-white/15 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {showCreateButton && (
              <CreateTagButton
                key="create-new"
                label={searchQuery.trim()}
                onClick={() => createCustomTag(searchQuery)}
              />
            )}
            {filteredTags.map((tag) => (
              <TagButton
                key={tag.id}
                tag={tag}
                onClick={() => addSelectedTag(tag)}
              />
            ))}
          </AnimatePresence>
          {filteredTags.length === 0 && !showCreateButton && (
            <span className="text-sm text-white/40">No tags found</span>
          )}
        </div>
      </div>
    </div>
  )
}
