"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import {
  Code,
  Palette,
  Box,
  Database,
  Shield,
  Sparkles,
  Type,
  ExternalLink,
  Lightbulb,
  BookOpen,
  ChevronRight,
  List,
  X,
} from "lucide-react";

// Table of Contents sections (in page order)
const tocSections = [
  { id: "frameworks", label: "Frameworks & Runtime" },
  { id: "styling", label: "Styling & UI" },
  { id: "animation", label: "Animation" },
  { id: "database", label: "Database & Backend" },
  { id: "auth", label: "Authentication & APIs" },
  { id: "utilities", label: "Utilities" },
  { id: "typography", label: "Typography" },
  { id: "inspiration", label: "Design Inspiration" },
  { id: "references", label: "Research & References" },
];

// Table of Contents component
function TableOfContents({
  activeSection,
  isVisible,
}: {
  activeSection: string;
  isVisible: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // Close popover on scroll (feels natural on mobile)
  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false);
      window.addEventListener("scroll", close, { passive: true });
      return () => window.removeEventListener("scroll", close);
    }
  }, [mobileOpen]);

  const tocList = (
    <nav className="space-y-1">
      {tocSections.map((section, index) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="flex items-center gap-2 w-full text-left transition-all duration-200"
          >
            {isActive ? (
              <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-3 h-3 text-white" />
              </span>
            ) : (
              <span className="w-5 shrink-0 text-white/40 text-xs">
                {index + 1}
              </span>
            )}
            <span
              className={`text-xs transition-colors ${
                isActive
                  ? "font-semibold text-white"
                  : "font-normal text-white/50 hover:text-white/70"
              }`}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar (xl+) */}
      <div
        className={`hidden xl:block fixed top-32 w-56 bg-neutral-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ left: "calc(50% - 38rem)" }}
      >
        <h3 className="text-sm font-bold text-white mb-3">Table of Contents</h3>
        {tocList}
      </div>

      {/* Mobile floating button + popover (below xl) */}
      <div
        ref={popoverRef}
        className={`xl:hidden fixed top-24 right-4 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-1.5 bg-neutral-800/95 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 shadow-lg shadow-black/30 transition-colors hover:bg-neutral-700/95"
          aria-label="Table of Contents"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="w-4 h-4 text-white/70" />
          ) : (
            <List className="w-4 h-4 text-white/70" />
          )}
          <span className="text-xs font-medium text-white/80">Contents</span>
        </button>

        {/* Popover dropdown */}
        <div
          className={`absolute right-0 mt-2 w-56 bg-neutral-800/95 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-xl shadow-black/40 transition-all duration-200 origin-top-right ${
            mobileOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <h3 className="text-sm font-bold text-white mb-3">
            Table of Contents
          </h3>
          {tocList}
        </div>
      </div>
    </>
  );
}

// Scroll animation component
function ScrollReveal({
  children,
  className = "",
  delay = 0,
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
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" },
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
        transform: hasMounted
          ? isVisible
            ? "translateY(0)"
            : "translateY(40px)"
          : "translateY(40px)",
        transition: hasMounted
          ? `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
          : "none",
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
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Attribution[];
}

const attributions: AttributionSection[] = [
  {
    id: "frameworks",
    title: "Frameworks & Runtime",
    icon: Code,
    items: [
      {
        name: "Next.js",
        description:
          "The React framework for production, providing server-side rendering and static site generation.",
        url: "https://nextjs.org",
        license: "MIT License",
      },
      {
        name: "React",
        description:
          "A JavaScript library for building user interfaces with a component-based architecture.",
        url: "https://react.dev",
        license: "MIT License",
      },
      {
        name: "TypeScript",
        description:
          "A typed superset of JavaScript that compiles to plain JavaScript.",
        url: "https://www.typescriptlang.org",
        license: "Apache 2.0",
      },
    ],
  },
  {
    id: "styling",
    title: "Styling & UI",
    icon: Palette,
    items: [
      {
        name: "Tailwind CSS",
        description:
          "A utility-first CSS framework for rapidly building custom user interfaces.",
        url: "https://tailwindcss.com",
        license: "MIT License",
      },
      {
        name: "Radix UI",
        description:
          "Unstyled, accessible components for building high-quality design systems.",
        url: "https://www.radix-ui.com",
        license: "MIT License",
      },
      {
        name: "Lucide React",
        description:
          "Beautiful and consistent icon toolkit made for React applications.",
        url: "https://lucide.dev",
        license: "ISC License",
      },
      {
        name: "class-variance-authority",
        description:
          "A library for creating variant-based component styles with TypeScript support.",
        url: "https://cva.style",
        license: "Apache 2.0",
      },
    ],
  },
  {
    id: "animation",
    title: "Animation",
    icon: Sparkles,
    items: [
      {
        name: "Motion (Framer Motion)",
        description:
          "A production-ready motion library for React, powering smooth animations and gestures.",
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
    id: "database",
    title: "Database & Backend",
    icon: Database,
    items: [
      {
        name: "Supabase",
        description:
          "An open-source Firebase alternative providing database, authentication, and real-time subscriptions.",
        url: "https://supabase.com",
        license: "Apache 2.0",
      },
    ],
  },
  {
    id: "auth",
    title: "Authentication & APIs",
    icon: Shield,
    items: [
      {
        name: "NextAuth.js",
        description:
          "Complete authentication solution for Next.js applications.",
        url: "https://authjs.dev",
        license: "ISC License",
      },
      {
        name: "Google Cloud Vision API",
        description:
          "Powerful image analysis for automatic item categorization and recognition.",
        url: "https://cloud.google.com/vision",
        license: "Google Cloud Terms",
      },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    icon: Box,
    items: [
      {
        name: "date-fns",
        description:
          "Modern JavaScript date utility library for parsing, formatting, and manipulating dates.",
        url: "https://date-fns.org",
        license: "MIT License",
      },
      {
        name: "react-dropzone",
        description:
          "Simple HTML5 drag-and-drop zone for file uploads in React.",
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
        description:
          "Utilities for constructing className strings conditionally.",
        url: "https://github.com/lukeed/clsx",
        license: "MIT License",
      },
    ],
  },
  {
    id: "typography",
    title: "Typography",
    icon: Type,
    items: [
      {
        name: "Nunito Sans",
        description:
          "A well-balanced sans-serif typeface used throughout the interface for readability.",
        url: "https://fonts.google.com/specimen/Nunito+Sans",
        license: "Open Font License",
      },
      {
        name: "JetBrains Mono",
        description:
          "A typeface designed for developers, used for code and monospaced text.",
        url: "https://www.jetbrains.com/lp/mono",
        license: "Open Font License",
      },
    ],
  },
  {
    id: "inspiration",
    title: "Design Inspiration",
    icon: Lightbulb,
    items: [
      {
        name: "21st.dev",
        description:
          "A curated collection of beautiful UI components and design patterns that inspired our interface design.",
        url: "https://21st.dev",
      },
      {
        name: "Dribbble",
        description:
          "A community of designers sharing screenshots of their work, process, and projects.",
        url: "https://dribbble.com",
      },
    ],
  },
];

export default function AttributionPage() {
  const [activeSection, setActiveSection] = useState("frameworks");
  const [tocVisible, setTocVisible] = useState(true);

  // Hide ToC when near footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const footerBuffer = 300;

      setTocVisible(scrollPosition < pageHeight - footerBuffer);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track which section is currently in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tocSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          },
          { threshold: 0.1, rootMargin: "-10% 0px -50% 0px" },
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 xl:pl-56">
      {/* Table of Contents */}
      <TableOfContents activeSection={activeSection} isVisible={tocVisible} />
      {/* Header */}
      <ScrollReveal className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Attribution
        </h1>
        <p className="text-white/60 mt-4 max-w-2xl mx-auto text-lg">
          Reclaimr is built with open-source software and tools from the
          developer community. We gratefully acknowledge the following projects.
        </p>
      </ScrollReveal>

      {/* Attribution Sections */}
      <div className="space-y-12">
        {attributions.map((section, sectionIndex) => (
          <ScrollReveal key={section.id} delay={sectionIndex * 50}>
            <div id={section.id} className="scroll-mt-24 space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {section.title}
                </h2>
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

      {/* Research & References Section */}
      <ScrollReveal delay={450} className="mt-16">
        <div id="references" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Research & References
            </h2>
          </div>

          <div className="bg-neutral-800/30 border border-white/5 rounded-lg p-6">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-4">
              APA Format (7th Edition)
            </p>
            <div className="space-y-4 text-sm text-white/70 leading-relaxed break-all">
              <p className="pl-8 -indent-8">
                Google. (2024). <em>Cloud Vision API documentation</em>. Google
                Cloud. <span>https://cloud.google.com/vision/docs</span>
              </p>
              <p className="pl-8 -indent-8">
                Nielsen Norman Group. (2024).{" "}
                <em>User experience research and usability guidelines</em>.{" "}
                <span>https://www.nngroup.com/articles/</span>
              </p>
              <p className="pl-8 -indent-8">
                OWASP Foundation. (2023).{" "}
                <em>OWASP authentication cheat sheet</em>.{" "}
                <span>
                  https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
                </span>
              </p>
              <p className="pl-8 -indent-8">
                Sailer, M., Hense, J. U., Mayr, S. K., & Mandl, H. (2017). How
                gamification motivates: An experimental study of the effects of
                specific game design elements on psychological need
                satisfaction. <em>Computers in Human Behavior, 69</em>, 371–380.{" "}
                <span>https://doi.org/10.1016/j.chb.2016.12.033</span>
              </p>
              <p className="pl-8 -indent-8">
                Supabase. (2024). <em>Supabase documentation</em>.{" "}
                <span>https://supabase.com/docs</span>
              </p>
              <p className="pl-8 -indent-8">
                U.S. Department of Education. (2021).{" "}
                <em>Family Educational Rights and Privacy Act (FERPA)</em>.{" "}
                <span>
                  https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
                </span>
              </p>
              <p className="pl-8 -indent-8">
                Vercel. (2024). <em>Next.js documentation</em>.{" "}
                <span>https://nextjs.org/docs</span>
              </p>
              <p className="pl-8 -indent-8">
                World Wide Web Consortium. (2023).{" "}
                <em>Web Content Accessibility Guidelines (WCAG) 2.2</em>. W3C.{" "}
                <span>https://www.w3.org/TR/WCAG22/</span>
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Footer Note */}
      <ScrollReveal delay={500} className="mt-16">
        <div className="text-center border-t border-white/10 pt-8">
          <p className="text-sm text-white/40">
            This project was created for the FBLA Website Design competition.
            All third-party libraries and assets are used in accordance with
            their respective licenses.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
