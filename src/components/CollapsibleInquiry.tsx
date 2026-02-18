"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import InquiryForm from "./InquiryForm";

export default function CollapsibleInquiry({ itemId }: { itemId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Have a question about the item?</span>
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
          <div className="p-4 pt-2 bg-neutral-800 border-t border-white/10">
            <InquiryForm itemId={itemId} />
          </div>
        </div>
      </div>
    </div>
  );
}
