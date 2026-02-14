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

// Category-based styling
const getCategoryStyles = (category?: string) => {
  switch (category) {
    case "color":
      return "bg-violet-500/15 border-violet-500/25 hover:bg-violet-500/25 hover:border-violet-500/40 active:bg-violet-500/40 active:border-violet-500/60"
    case "size":
      return "bg-amber-500/15 border-amber-500/25 hover:bg-amber-500/25 hover:border-amber-500/40 active:bg-amber-500/40 active:border-amber-500/60"
    case "material":
      return "bg-cyan-500/15 border-cyan-500/25 hover:bg-cyan-500/25 hover:border-cyan-500/40 active:bg-cyan-500/40 active:border-cyan-500/60"
    case "type":
      return "bg-rose-500/15 border-rose-500/25 hover:bg-rose-500/25 hover:border-rose-500/40 active:bg-rose-500/40 active:border-rose-500/60"
    default:
      return "bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 active:bg-white/35 active:border-white/40"
  }
}

// Simple Tag Button Component
const TagButton: React.FC<{
  tag: Tag
  onClick: () => void
}> = ({ tag, onClick }) => (
  <motion.button
    type="button"
    className={`relative overflow-hidden rounded-lg shrink-0 cursor-pointer px-3 py-1.5 border transition-colors ${getCategoryStyles(tag.category)}`}
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="text-white font-medium text-sm">{tag.label}</span>
  </motion.button>
)

// Create new tag button component
const CreateTagButton: React.FC<{
  label: string
  onClick: () => void
}> = ({ label, onClick }) => (
  <motion.button
    type="button"
    className="relative overflow-hidden rounded-lg shrink-0 cursor-pointer px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 hover:border-primary-500/50 transition-colors flex items-center gap-1.5"
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
    whileTap={{ scale: 0.95 }}
  >
    <Plus className="size-3.5 text-primary-400" />
    <span className="text-white font-medium text-sm">{label}</span>
  </motion.button>
)

// Selected tag component
const SelectedTag: React.FC<{
  tag: Tag
  onRemove: () => void
}> = ({ tag, onRemove }) => (
  <motion.div
    className="relative overflow-hidden rounded-lg h-full shrink-0 flex items-center gap-1 pl-3 pr-1 py-1 bg-green-500/20 border border-green-500/30"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
  >
    <span className="text-white font-medium text-sm">{tag.label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="p-1 hover:bg-white/20 transition-colors rounded-md"
    >
      <X className="size-3.5 text-white/70" />
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

  // Filter available tags based on search query
  const availableTags = tags.filter(
    (tag) => !selectedTags.some((selected) => selected.id === tag.id)
  )

  const filteredTags = searchQuery
    ? availableTags.filter((tag) =>
        tag.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTags

  // Check if search query matches any existing tag (including selected)
  const queryMatchesExistingTag = searchQuery && (
    tags.some((tag) => tag.label.toLowerCase() === searchQuery.toLowerCase().trim()) ||
    selectedTags.some((tag) => tag.label.toLowerCase() === searchQuery.toLowerCase().trim())
  )

  // Show create button if there's a query that doesn't exactly match an existing tag
  const showCreateButton = searchQuery.trim() && !queryMatchesExistingTag

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
        {title}
      </h2>

      {/* Selected tags container */}
      <div
        className="w-full flex items-center justify-start gap-2 min-h-[3rem] mb-3 overflow-x-auto p-2 no-scrollbar rounded-xl bg-white/5 border border-white/10"
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
      <div className="p-3 w-full rounded-xl bg-white/5 border border-white/10">
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or create a tag..."
            className="w-full pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 bg-white/10 rounded-lg border border-white/10 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {/* Create custom tag button */}
            {showCreateButton && (
              <CreateTagButton
                key="create-new"
                label={searchQuery.trim()}
                onClick={() => createCustomTag(searchQuery)}
              />
            )}
            {/* Filtered available tags */}
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
