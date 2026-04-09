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
  Github,
  GitCommit,
  GitBranch,
  Users,
  FileCode,
  Folder,
  CheckCircle2,
  Star,
  Award,
  FileText,
  Scale,
} from "lucide-react";

// Table of Contents sections (in page order)
const tocSections = [
  { id: "repository", label: "Source Code & Repository" },
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

// GitHub repository configuration
const GITHUB_OWNER = "ishaan-17";
const GITHUB_REPO = "fbla2026";
const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;

// Static fallback data (verified from GitHub API at build time)
// Used if the live API call fails or is rate-limited
const STATIC_REPO_DATA = {
  description: "Reclaimr — FBLA 2026 Website Coding & Development project",
  defaultBranch: "main",
  createdAt: "2025-10-25",
  pushedAt: "2026-04-07",
  totalCommits: 105,
  languages: [
    { name: "TypeScript", bytes: 725470, color: "#3178c6" },
    { name: "JavaScript", bytes: 28935, color: "#f7df1e" },
    { name: "CSS", bytes: 8854, color: "#563d7c" },
    { name: "PLpgSQL", bytes: 5156, color: "#336791" },
  ],
  contributors: [
    {
      login: "ishaan-17",
      contributions: 38,
      avatar: "https://avatars.githubusercontent.com/u/165828448?v=4",
    },
    {
      login: "nikrp",
      contributions: 46,
      avatar: "https://avatars.githubusercontent.com/u/76831568?v=4",
    },
    {
      login: "chlo6",
      contributions: 21,
      avatar: "https://avatars.githubusercontent.com/u/162272068?v=4",
    },
  ],
};

// Top-level project structure (matches actual repo)
const repoStructure = [
  {
    name: "src/",
    description: "Next.js App Router pages, components & API routes",
    type: "dir" as const,
  },
  {
    name: "public/",
    description: "Static assets (images, icons, fonts)",
    type: "dir" as const,
  },
  {
    name: "supabase/",
    description: "Database schema & PostgreSQL migrations",
    type: "dir" as const,
  },
  {
    name: "scripts/",
    description: "Build and setup automation scripts",
    type: "dir" as const,
  },
  {
    name: "auth.ts",
    description: "NextAuth.js authentication configuration",
    type: "file" as const,
  },
  {
    name: "next.config.ts",
    description: "Next.js framework configuration",
    type: "file" as const,
  },
  {
    name: "package.json",
    description: "Project dependencies & scripts",
    type: "file" as const,
  },
  {
    name: "README.md",
    description: "Project documentation & setup guide",
    type: "file" as const,
  },
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

// Types for live GitHub data
interface LiveRepoData {
  description: string | null;
  defaultBranch: string;
  pushedAt: string;
  languages: { name: string; bytes: number; color: string }[];
  contributors: { login: string; contributions: number; avatar: string }[];
  totalCommits: number;
  recentCommits: {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  }[];
}

// Color map for GitHub languages
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  CSS: "#563d7c",
  PLpgSQL: "#336791",
  HTML: "#e34c26",
  Python: "#3572A5",
  Shell: "#89e051",
};

// GitHub repository section — addresses Source Code & Documentation rubric
function GitHubSection() {
  const [data, setData] = useState<LiveRepoData | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRepoData() {
      try {
        const base = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

        const [repoRes, langRes, contribRes, commitsRes] = await Promise.all([
          fetch(base),
          fetch(`${base}/languages`),
          fetch(`${base}/contributors?per_page=10`),
          fetch(`${base}/commits?per_page=5`),
        ]);

        if (
          !repoRes.ok ||
          !langRes.ok ||
          !contribRes.ok ||
          !commitsRes.ok
        ) {
          return;
        }

        const repoJson = await repoRes.json();
        const langJson = await langRes.json();
        const contribJson = await contribRes.json();
        const commitsJson = await commitsRes.json();

        // Get total commit count via Link header pagination
        let totalCommits = STATIC_REPO_DATA.totalCommits;
        try {
          const commitCountRes = await fetch(`${base}/commits?per_page=1`);
          const linkHeader = commitCountRes.headers.get("Link");
          if (linkHeader) {
            const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (match) totalCommits = parseInt(match[1], 10);
          }
        } catch {
          // use fallback
        }

        if (cancelled) return;

        const languages = Object.entries(
          langJson as Record<string, number>,
        ).map(([name, bytes]) => ({
          name,
          bytes: bytes as number,
          color: LANGUAGE_COLORS[name] ?? "#8b949e",
        }));

        const contributors = (contribJson as Array<{
          login: string;
          contributions: number;
          avatar_url: string;
        }>).map((c) => ({
          login: c.login,
          contributions: c.contributions,
          avatar: c.avatar_url,
        }));

        const recentCommits = (commitsJson as Array<{
          sha: string;
          html_url: string;
          commit: {
            message: string;
            author: { name: string; date: string };
          };
        }>).map((c) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author.name,
          date: c.commit.author.date,
          url: c.html_url,
        }));

        setData({
          description: repoJson.description,
          defaultBranch: repoJson.default_branch,
          pushedAt: repoJson.pushed_at,
          languages,
          contributors,
          totalCommits,
          recentCommits,
        });
        setIsLive(true);
      } catch {
        // Silently fall back to static data
      }
    }

    fetchRepoData();
    return () => {
      cancelled = true;
    };
  }, []);

  const description = data?.description ?? STATIC_REPO_DATA.description;
  const defaultBranch =
    data?.defaultBranch ?? STATIC_REPO_DATA.defaultBranch;
  const languages = data?.languages ?? STATIC_REPO_DATA.languages;
  const contributors = data?.contributors ?? STATIC_REPO_DATA.contributors;
  const totalCommits = data?.totalCommits ?? STATIC_REPO_DATA.totalCommits;
  const recentCommits = data?.recentCommits ?? [];
  const lastUpdated = data?.pushedAt ?? STATIC_REPO_DATA.pushedAt;

  const totalBytes = languages.reduce((sum, l) => sum + l.bytes, 0);

  const formattedDate = new Date(lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div id="repository" className="scroll-mt-24 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
          <Github className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          Source Code & Repository
        </h2>
      </div>

      {/* Repository Hero Card */}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 hover:from-neutral-800 hover:to-neutral-900 border border-white/10 hover:border-primary-500/30 rounded-xl p-6 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Github className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/50 font-mono">
                {GITHUB_OWNER} /
              </span>
              <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {GITHUB_REPO}
              </h3>
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 font-medium">
                Public
              </span>
              {isLive && (
                <span className="text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                {defaultBranch}
              </span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                All rights reserved
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                Last updated {formattedDate}
              </span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
        </div>
      </a>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-4 text-center">
          <GitCommit className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalCommits}</div>
          <div className="text-xs text-white/50 mt-1">Commits</div>
        </div>
        <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-4 text-center">
          <Users className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {contributors.length}
          </div>
          <div className="text-xs text-white/50 mt-1">Contributors</div>
        </div>
        <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-4 text-center">
          <FileCode className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {languages.length}
          </div>
          <div className="text-xs text-white/50 mt-1">Languages</div>
        </div>
        <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-4 text-center">
          <Star className="w-5 h-5 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-xs text-white/50 mt-1">Original</div>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary-400" />
            Language Composition
          </h3>
          <span className="text-xs text-white/40">
            {(totalBytes / 1024).toFixed(0)} KB of source
          </span>
        </div>

        {/* Stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden bg-neutral-900">
          {languages.map((lang) => {
            const pct = (lang.bytes / totalBytes) * 100;
            return (
              <div
                key={lang.name}
                style={{ width: `${pct}%`, backgroundColor: lang.color }}
                title={`${lang.name}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {languages.map((lang) => {
            const pct = (lang.bytes / totalBytes) * 100;
            return (
              <div
                key={lang.name}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-white/80 font-medium">{lang.name}</span>
                <span className="text-white/40">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contributors */}
      <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary-400" />
          Contributors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contributors.map((c) => (
            <a
              key={c.login}
              href={`https://github.com/${c.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-primary-500/30 rounded-lg p-3 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar}
                alt={`${c.login} avatar`}
                className="w-10 h-10 rounded-full border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                  @{c.login}
                </div>
                <div className="text-xs text-white/50">
                  {c.contributions} commits
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Repository Structure */}
      <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Folder className="w-4 h-4 text-primary-400" />
          Repository Structure
        </h3>
        <div className="space-y-1.5 font-mono text-xs">
          {repoStructure.map((item) => (
            <a
              key={item.name}
              href={`${GITHUB_URL}/${
                item.type === "dir" ? "tree" : "blob"
              }/${defaultBranch}/${item.name.replace(/\/$/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
            >
              {item.type === "dir" ? (
                <Folder className="w-4 h-4 text-primary-400/70 flex-shrink-0 mt-0.5" />
              ) : (
                <FileText className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-white/90 group-hover:text-primary-400 transition-colors font-semibold min-w-[140px]">
                {item.name}
              </span>
              <span className="text-white/50 font-sans text-xs">
                {item.description}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Commits (only shown if live data loaded) */}
      {recentCommits.length > 0 && (
        <div className="bg-neutral-800/50 border border-white/5 rounded-lg p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <GitCommit className="w-4 h-4 text-primary-400" />
            Recent Commits
          </h3>
          <div className="space-y-2">
            {recentCommits.map((commit) => (
              <a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 py-2 px-3 rounded hover:bg-white/5 transition-colors border-l-2 border-primary-500/30 hover:border-primary-500"
              >
                <code className="text-xs text-primary-400/80 font-mono mt-0.5 flex-shrink-0">
                  {commit.sha}
                </code>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/90 group-hover:text-white transition-colors truncate">
                    {commit.message}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {commit.author} •{" "}
                    {new Date(commit.date).toLocaleDateString()}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Originality & Ownership Statement */}
      <div className="bg-gradient-to-br from-primary-500/5 to-neutral-800/50 border border-primary-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">
              Originality & Ownership
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Every line of application code in this repository was written
              from scratch by our team. Reclaimr is not based on a template,
              starter kit, boilerplate, or site builder. The UI components,
              page layouts, database schema, API routes, and business logic
              are entirely our own work.
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No templates used.</strong>{" "}
                  The project was initialized with a vanilla{" "}
                  <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
                    create-next-app
                  </code>{" "}
                  scaffold and built up from there.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Full version history.</strong>{" "}
                  Every change is tracked in Git with meaningful commit
                  messages, demonstrating our day-to-day development process
                  from initial scaffold through final polish.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    Third-party libraries are credited below.
                  </strong>{" "}
                  Every open-source package we depend on is listed in the
                  sections that follow, along with its license and purpose.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    Publicly auditable.
                  </strong>{" "}
                  The complete source code is available at the repository link
                  above so judges can verify authorship and review the
                  development process.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-black hover:bg-white/90 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Github className="w-4 h-4" />
          View Repository
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={`${GITHUB_URL}/blob/${defaultBranch}/README.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Read README
        </a>
        <a
          href={`${GITHUB_URL}/commits/${defaultBranch}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <GitCommit className="w-4 h-4" />
          Commit History
        </a>
      </div>
    </div>
  );
}

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

      {/* GitHub / Source Code Section */}
      <ScrollReveal className="mb-12">
        <GitHubSection />
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
