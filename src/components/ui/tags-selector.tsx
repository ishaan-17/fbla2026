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
      <motion.h2 layout className="text-sm font-bold text-earth-900 uppercase tracking-wider mb-3">
        {title}
      </motion.h2>
      
      {/* Selected tags container */}
      <motion.div
        className="w-full flex items-center justify-start gap-1.5 bg-white border border-earth-300 h-14 mb-3 overflow-x-auto p-1.5 no-scrollbar"
        ref={selectedsContainerRef}
        layout
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-earth-400 px-3">Click tags below to add them</span>
        ) : (
          selectedTags.map((tag) => (
            <motion.div
              key={tag.id}
              className="flex items-center gap-1 pl-3 pr-1 py-1 bg-primary-50 border border-primary-200 h-full shrink-0 rounded"
              layoutId={`tag-${tag.id}`}
            >
              <motion.span
                layoutId={`tag-${tag.id}-label`}
                className="text-earth-700 font-medium text-sm"
              >
                {tag.label}
              </motion.span>
              <button
                type="button"
                onClick={() => removeSelectedTag(tag.id)}
                className="p-1 hover:bg-primary-100 transition-colors"
              >
                <X className="size-4 text-earth-500" />
              </button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Available tags */}
      <AnimatePresence>
        {availableTags.length > 0 && (
          <motion.div
            className="bg-earth-50 border border-earth-200 p-2 w-full"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <motion.button
                  type="button"
                  key={tag.id}
                  layoutId={`tag-${tag.id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-earth-200 shrink-0 hover:border-earth-400 transition-colors rounded"
                  onClick={() => addSelectedTag(tag)}
                >
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="text-earth-700 font-medium text-sm"
                  >
                    {tag.label}
                  </motion.span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
