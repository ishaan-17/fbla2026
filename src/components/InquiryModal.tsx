"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import InquiryForm from "./InquiryForm";

export default function InquiryModal({ itemId }: { itemId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap and return focus on close
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the close button when dialog opens
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to trigger when dialog closes
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        aria-label="Ask a question about this item"
        className="w-full flex items-center justify-center gap-3 p-4 bg-neutral-800 hover:bg-neutral-700/50 border border-white/10 rounded-xl transition-colors"
      >
        <div className="w-8 h-8 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">
          Have a question about the item?
        </span>
      </button>

      {/* Modal Backdrop & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ask a question about this item"
            className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2
                className="text-lg font-bold text-white"
                id="inquiry-modal-title"
              >
                Ask a Question
              </h2>
              <button
                ref={closeRef}
                onClick={handleClose}
                aria-label="Close dialog"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="w-5 h-5 text-white/60" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <InquiryForm itemId={itemId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
