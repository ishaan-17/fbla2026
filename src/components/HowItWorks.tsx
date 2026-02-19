"use client";

import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery";
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from "@/components/ScrollReveal";
import ScrollFloat from "@/components/ui/scroll-float";

const steps: GalleryItem[] = [
  {
    step: "01",
    title: "Find an Item",
    desc: "Spot something that doesn't belong to you? Pick it up and bring it to safety.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Take a Photo",
    desc: "Snap a clear picture of the item. This helps owners identify their belongings quickly.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "AI Categorizes",
    desc: "Our smart AI automatically identifies and categorizes the item for you. No manual work needed!",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Submit Report",
    desc: "Fill in where and when you found it. Add any details that might help identify the owner.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Admin Approves",
    desc: "School staff reviews and approves the listing. This keeps everything organized and secure.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Owner Claims",
    desc: "The rightful owner finds their item and submits a claim with proof of ownership.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    step: "07",
    title: "Verified & Reunited",
    desc: "Admin verifies the claim and coordinates the handoff. Item returned to its happy owner!",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    step: "08",
    title: "Earn Rewards",
    desc: "Get points for your good deed! Climb the leaderboard and earn recognition for helping others.",
    icon: (
      <svg className="w-20 h-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <ScrollRevealStagger className="relative text-center mb-8" staggerDelay={0.1}>
        <ScrollRevealItem>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            <ScrollFloat stagger={0.03}>
              How It Works
            </ScrollFloat>
          </h2>
        </ScrollRevealItem>
        <ScrollRevealItem>
          <p className="text-white/70 mt-4 max-w-lg mx-auto text-lg">
            Eight simple steps to help lost items find their owners
          </p>
        </ScrollRevealItem>
        <ScrollRevealItem>
          <p className="text-white/40 mt-2 text-sm">
            Hover to pause • Click dots to navigate
          </p>
        </ScrollRevealItem>
      </ScrollRevealStagger>

      {/* Circular Gallery Carousel */}
      <ScrollReveal delay={0.3} direction="up">
        <CircularGallery
          items={steps}
          radius={400}
          autoRotateSpeed={0.12}
        />
      </ScrollReveal>
    </section>
  );
}
