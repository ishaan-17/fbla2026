"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { Code, Palette, Box, Database, Shield, Sparkles, Type, ExternalLink, Lightbulb } from "lucide-react";

// Scroll animation component
function ScrollReveal({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasMounted]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hasMounted ? (isVisible ? 1 : 0) : 0,
        transform: hasMounted ? (isVisible ? "translateY(0)" : "translateY(40px)") : "translateY(40px)",
        transition: hasMounted ? `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms` : "none",
      }}
    >
      {children}
    </div>
  );
}

interface Attribution {
  name: string;
  description: string;
  url: string;
  license?: string;
}

interface AttributionSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Attribution[];
}

const attributions: AttributionSection[] = [
  {
    title: "Frameworks & Runtime",
    icon: Code,
    items: [
      {
        name: "Next.js",
        description: "The React framework for production, providing server-side rendering and static site generation.",
        url: "https://nextjs.org",
        license: "MIT License",
      },
      {
        name: "React",
        description: "A JavaScript library for building user interfaces with a component-based architecture.",
        url: "https://react.dev",
        license: "MIT License",
      },
      {
        name: "TypeScript",
        description: "A typed superset of JavaScript that compiles to plain JavaScript.",
        url: "https://www.typescriptlang.org",
        license: "Apache 2.0",
      },
    ],
  },
  {
    title: "Styling & UI",
    icon: Palette,
    items: [
      {
        name: "Tailwind CSS",
        description: "A utility-first CSS framework for rapidly building custom user interfaces.",
        url: "https://tailwindcss.com",
        license: "MIT License",
      },
      {
        name: "Radix UI",
        description: "Unstyled, accessible components for building high-quality design systems.",
        url: "https://www.radix-ui.com",
        license: "MIT License",
      },
      {
        name: "Lucide React",
        description: "Beautiful and consistent icon toolkit made for React applications.",
        url: "https://lucide.dev",
        license: "ISC License",
      },
      {
        name: "class-variance-authority",
        description: "A library for creating variant-based component styles with TypeScript support.",
        url: "https://cva.style",
        license: "Apache 2.0",
      },
    ],
  },
  {
    title: "Animation",
    icon: Sparkles,
    items: [
      {
        name: "Motion (Framer Motion)",
        description: "A production-ready motion library for React, powering smooth animations and gestures.",
        url: "https://motion.dev",
        license: "MIT License",
      },
      {
        name: "GSAP",
        description: "Professional-grade animation library for the modern web.",
        url: "https://gsap.com",
        license: "Standard License",
      },
    ],
  },
  {
    title: "Database & Backend",
    icon: Database,
    items: [
      {
        name: "Supabase",
        description: "An open-source Firebase alternative providing database, authentication, and real-time subscriptions.",
        url: "https://supabase.com",
        license: "Apache 2.0",
      },
    ],
  },
  {
    title: "Authentication & APIs",
    icon: Shield,
    items: [
      {
        name: "NextAuth.js",
        description: "Complete authentication solution for Next.js applications.",
        url: "https://authjs.dev",
        license: "ISC License",
      },
      {
        name: "Google Cloud Vision API",
        description: "Powerful image analysis for automatic item categorization and recognition.",
        url: "https://cloud.google.com/vision",
        license: "Google Cloud Terms",
      },
    ],
  },
  {
    title: "Utilities",
    icon: Box,
    items: [
      {
        name: "date-fns",
        description: "Modern JavaScript date utility library for parsing, formatting, and manipulating dates.",
        url: "https://date-fns.org",
        license: "MIT License",
      },
      {
        name: "react-dropzone",
        description: "Simple HTML5 drag-and-drop zone for file uploads in React.",
        url: "https://react-dropzone.js.org",
        license: "MIT License",
      },
      {
        name: "react-day-picker",
        description: "Flexible date picker component for React applications.",
        url: "https://react-day-picker.js.org",
        license: "MIT License",
      },
      {
        name: "clsx & tailwind-merge",
        description: "Utilities for constructing className strings conditionally.",
        url: "https://github.com/lukeed/clsx",
        license: "MIT License",
      },
    ],
  },
  {
    title: "Typography",
    icon: Type,
    items: [
      {
        name: "Nunito Sans",
        description: "A well-balanced sans-serif typeface used throughout the interface for readability.",
        url: "https://fonts.google.com/specimen/Nunito+Sans",
        license: "Open Font License",
      },
      {
        name: "JetBrains Mono",
        description: "A typeface designed for developers, used for code and monospaced text.",
        url: "https://www.jetbrains.com/lp/mono",
        license: "Open Font License",
      },
    ],
  },
  {
    title: "Design Inspiration",
    icon: Lightbulb,
    items: [
      {
        name: "21st.dev",
        description: "A curated collection of beautiful UI components and design patterns that inspired our interface design.",
        url: "https://21st.dev",
      },
    ],
  },
];

export default function AttributionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <ScrollReveal className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Attribution
        </h1>
        <p className="text-white/60 mt-4 max-w-2xl mx-auto text-lg">
          Reclaimr is built with open-source software and tools from the developer community. We gratefully acknowledge the following projects.
        </p>
      </ScrollReveal>

      {/* Attribution Sections */}
      <div className="space-y-12">
        {attributions.map((section, sectionIndex) => (
          <ScrollReveal key={section.title} delay={sectionIndex * 50}>
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>

              {/* Items */}
              <div className="grid gap-3">
                {section.items.map((item, itemIndex) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-lg p-4 transition-all duration-200"
                    style={{ animationDelay: `${itemIndex * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {item.name}
                          </h3>
                          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-primary-400 transition-colors" />
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      {item.license && (
                        <span className="flex-shrink-0 text-xs text-white/40 bg-white/5 px-2 py-1 rounded">
                          {item.license}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Footer Note */}
      <ScrollReveal delay={400} className="mt-16">
        <div className="text-center border-t border-white/10 pt-8">
          <p className="text-sm text-white/40">
            This project was created for the FBLA Website Design competition. All third-party libraries and assets are used in accordance with their respective licenses.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
