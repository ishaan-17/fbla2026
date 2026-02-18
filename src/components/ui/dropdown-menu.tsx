"use client";

import { ChevronDown, Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DropdownOption = {
  label: string;
  value: string;
  Icon?: React.ReactNode;
};

type DropdownMenuProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const DropdownMenu = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  className 
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onChange?.(option.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          "w-full h-[46px] px-4 text-sm text-left flex items-center justify-between",
          "rounded-xl transition-all duration-200",
          // Liquid glass effect for dark mode
          "bg-white/10 backdrop-blur-sm",
          "shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]",
          "hover:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)]",
          "border border-white/20",
          selectedOption ? "text-white" : "text-white/50"
        )}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-white/50" />
        </motion.span>
      </button>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -5, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2"
          >
            {/* Liquid Glass Container - matching calendar popover */}
            <div
              className="relative overflow-hidden rounded-2xl"
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
                className="absolute inset-0 z-0 rounded-2xl"
                style={{
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                }}
              />

              {/* Gradient overlay for depth */}
              <div
                className="absolute inset-0 z-10 rounded-2xl"
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

              {/* Inner edge highlights */}
              <div
                className="absolute inset-0 z-20 rounded-2xl pointer-events-none"
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
                className="absolute inset-0 z-[25] rounded-2xl pointer-events-none"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                }}
              />

              {/* Content */}
              <div className="relative z-30 p-2">
                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 bg-black/20 rounded-xl border border-white/15 focus:outline-none focus:border-white/30 focus:bg-black/25 transition-all"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  />
                </div>
                
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <motion.button
                        type="button"
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                          ease: "easeOut",
                        }}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 rounded-xl",
                          "transition-all duration-150",
                          option.value === value
                            ? "bg-white/25 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]"
                            : "text-white/90 hover:bg-white/15 hover:text-white"
                        )}
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                      >
                        {option.Icon && <span className="shrink-0">{option.Icon}</span>}
                        {option.label}
                      </motion.button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-white/50 text-sm">No results found</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DropdownMenu };
export type { DropdownOption, DropdownMenuProps };
