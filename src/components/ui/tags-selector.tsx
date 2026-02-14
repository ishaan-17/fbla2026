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

// Simple Tag Button Component
const TagButton: React.FC<{
  tag: Tag
  onClick: () => void
}> = ({ tag, onClick }) => (
  <motion.button
    type="button"
    className="relative overflow-hidden rounded-lg shrink-0 cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-colors"
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

      {/* Available tags */}
      {availableTags.length > 0 && (
        <div className="p-3 w-full rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {availableTags.map((tag) => (
                <TagButton
                  key={tag.id}
                  tag={tag}
                  onClick={() => addSelectedTag(tag)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
