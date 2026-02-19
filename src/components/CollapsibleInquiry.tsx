"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import InquiryForm from "./InquiryForm";

export default function CollapsibleInquiry({ itemId }: { itemId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] hover:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] hover:border-white/30"
      >
        <div className="flex items-center gap-3">
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
        </div>
        <ChevronDown
          className={`w-5 h-5 text-white/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 mt-2 rounded-xl bg-neutral-800 border border-white/10">
            <InquiryForm itemId={itemId} />
          </div>
        </div>
      </div>
    </div>
  );
}
