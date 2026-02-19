"use client";

import Link from "next/link";
import { Camera, Users, Trophy, Heart, MapPin, Mail, Phone, Search, AlertCircle, Gift, Clock, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import CardSwap, { Card } from "@/components/CardSwap";

// Table of Contents sections (in page order)
const tocSections = [
  { id: "mission", label: "Our Mission" },
  { id: "policy", label: "30-Day Policy" },
  { id: "rewards", label: "Rewards" },
  { id: "how-it-works", label: "How It Works" },
  { id: "contact", label: "Contact" },
];

// Table of Contents component
function TableOfContents({ activeSection, isVisible }: { activeSection: string; isVisible: boolean }) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div 
      className={`hidden xl:block fixed top-32 w-48 bg-neutral-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ left: "max(1rem, calc((100vw - 72rem) / 4 + 0.5rem))" }}
    >
      <h3 className="text-sm font-bold text-white mb-3">Table of Contents</h3>
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
                <span className="w-5 flex-shrink-0 text-white/40 text-xs">
                  {index + 1}
                </span>
              )}
              <span className={`text-xs transition-colors ${
                isActive 
                  ? "font-semibold text-white" 
                  : "font-normal text-white/50 hover:text-white/70"
              }`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

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

  // Wait for mount before enabling animations
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

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("mission");
  const [tocVisible, setTocVisible] = useState(true);

  // Hide ToC when near footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const footerBuffer = 300; // Hide when within 300px of bottom
      
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
          { threshold: 0.1, rootMargin: "-10% 0px -50% 0px" }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 xl:pl-56">
      {/* Table of Contents */}
      <TableOfContents activeSection={activeSection} isVisible={tocVisible} />

      {/* Header */}
      <ScrollReveal className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          About Reclaimr
        </h1>
        <p className="text-white/60 mt-4 max-w-2xl mx-auto text-lg">
          Everything you need to know about how our school&apos;s lost and found system works.
        </p>
      </ScrollReveal>

      <div className="space-y-24">
        {/* Mission - Split Layout */}
        <section id="mission" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Our Mission</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
              Reuniting Communities,<br />One Item at a Time
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Our Lost & Found platform is built to help our school community reunite with their belongings quickly and efficiently. Powered by <strong className="text-white">AI image recognition</strong>, the system automatically categorizes found items to make searching easier.
            </p>
            <p className="text-white/70 leading-relaxed">
              We reward students who take the time to report items they find, building a culture of <strong className="text-white">kindness and responsibility</strong>.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150} className="flex items-center justify-center">
            <div className="h-[380px] w-full relative flex items-center justify-center pt-12" style={{ clipPath: "inset(-100px -100px 0 -100px)" }}>
              <CardSwap
                width={280}
                height={180}
                cardDistance={50}
                verticalDistance={50}
                dropDistance={220}
                delay={3000}
                pauseOnHover={true}
                easing="elastic"
              >
                <Card className="group relative bg-neutral-800/95 backdrop-blur-sm border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="relative p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Recognition</h3>
                    <p className="text-sm text-white/60 leading-relaxed">Smart auto-categorization powered by machine learning</p>
                  </div>
                </Card>
                <Card className="group relative bg-neutral-800/95 backdrop-blur-sm border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <div className="relative p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                      <Users className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Community Driven</h3>
                    <p className="text-sm text-white/60 leading-relaxed">Built for students, by students</p>
                  </div>
                </Card>
                <Card className="group relative bg-neutral-800/95 backdrop-blur-sm border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <div className="relative p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                      <Trophy className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Rewards System</h3>
                    <p className="text-sm text-white/60 leading-relaxed">Earn points for helping others</p>
                  </div>
                </Card>
                <Card className="group relative bg-neutral-800/95 backdrop-blur-sm border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-500 opacity-10" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
                  <div className="relative p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
                      <Heart className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Give Back</h3>
                    <p className="text-sm text-white/60 leading-relaxed">30-day donation policy for unclaimed items</p>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </ScrollReveal>
        </section>

        {/* 30-Day Donation Policy - Chevron Flow */}
        <section id="policy" className="scroll-mt-24">
          <ScrollReveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Donation Policy</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              30-Day Donation Policy
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              To keep our lost and found system manageable and give items the best chance of being useful, we have a 30-day policy on all unclaimed items.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-col md:flex-row w-full">
              {[
                {
                  step: "1",
                  badge: "Days 1-14",
                  title: "Active Listing",
                  desc: "Items are fully searchable and available for claiming.",
                  color: "bg-[#6BBD6E]",
                },
                {
                  step: "2",
                  badge: "Days 15-30",
                  title: "Expiring Soon",
                  desc: "Items show a countdown badge. Last chance to claim!",
                  color: "bg-[#4AB89D]",
                },
                {
                  step: "3",
                  badge: "After 30 Days",
                  title: "Donated to Charity",
                  desc: "Unclaimed items go to local charities in need.",
                  color: "bg-[#35A7BF]",
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`relative flex-1 ${item.color} flex flex-col items-center justify-center text-center px-8 py-8 md:py-10 min-h-[200px]`}
                  style={{
                    clipPath: i === arr.length - 1
                      ? "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 28px 50%)"
                      : "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 28px 50%)",
                    marginLeft: i === 0 ? "0" : "-14px",
                  }}
                >
                  <span className="text-5xl md:text-6xl font-extrabold text-white/90 mb-1">
                    {item.step}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                    {item.badge}
                  </span>
                  <p className="text-sm font-semibold text-neutral-800 leading-tight max-w-[160px] mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-neutral-700/80 leading-tight max-w-[160px]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-center text-sm text-white/40 mt-8 max-w-2xl mx-auto">
              This policy helps ensure that items are either returned to their owners or go to someone who can use them. If you know you&apos;ve lost something, please check the listings regularly!
            </p>
          </ScrollReveal>
        </section>

        {/* Rewards - Split Layout */}
        <section id="rewards" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <ScrollReveal>
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Rewards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Earn Points<br />
                <span className="text-white">for Helping</span>
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                We believe in recognizing people who help our community. Our points system rewards you for being a good citizen.
              </p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors"
              >
                View the leaderboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal delay={0}>
              <div className="flex flex-col items-center">
                {/* Points badge */}
                <div className="relative">
                  <div className="border-2 border-[#4AB89D] rounded-full px-8 py-4">
                    <span className="text-2xl font-bold text-[#4AB89D]">+10 pts</span>
                  </div>
                  {/* Vertical line */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 bg-[#4AB89D]"></div>
                  {/* Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+32px)] w-3 h-3 rounded-full bg-[#4AB89D]"></div>
                </div>
                {/* Content */}
                <div className="mt-12 text-center">
                  <h3 className="text-xl font-bold text-white">01 Item Reported</h3>
                  <p className="text-sm text-white/60 mt-3 max-w-[200px] mx-auto">Submit a found item report with photo and details to help reunite it with the owner.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="flex flex-col items-center">
                {/* Points badge */}
                <div className="relative">
                  <div className="border-2 border-[#35A7BF] rounded-full px-8 py-4">
                    <span className="text-2xl font-bold text-[#35A7BF]">+25 pts</span>
                  </div>
                  {/* Vertical line */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 bg-[#35A7BF]"></div>
                  {/* Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+32px)] w-3 h-3 rounded-full bg-[#35A7BF]"></div>
                </div>
                {/* Content */}
                <div className="mt-12 text-center">
                  <h3 className="text-xl font-bold text-white">02 Item Returned</h3>
                  <p className="text-sm text-white/60 mt-3 max-w-[200px] mx-auto">Bonus points when your found item is successfully claimed and verified by the owner.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How It Works - Steps */}
        <section id="how-it-works" className="scroll-mt-24">
          <ScrollReveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Process</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              How It Works
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-col md:flex-row w-full">
              {[
                {
                  step: "Step 1",
                  title: "Report Item",
                  desc: "Take a photo and submit a report",
                  color: "bg-primary-400",
                },
                {
                  step: "Step 2",
                  title: "Admin Review",
                  desc: "Admins verify the report is genuine",
                  color: "bg-primary-500",
                },
                {
                  step: "Step 3",
                  title: "Search & Claim",
                  desc: "Browse or search, then submit a claim",
                  color: "bg-primary-600",
                },
                {
                  step: "Step 4",
                  title: "Collect Item",
                  desc: "Verified! Collect your item",
                  color: "bg-primary-700",
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`relative flex-1 ${item.color} flex items-center justify-center text-center px-8 py-5 min-h-[100px]`}
                  style={{
                    clipPath: i === 0
                      ? "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
                      : i === arr.length - 1
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)"
                      : "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)",
                    marginLeft: i === 0 ? "0" : "-10px",
                  }}
                >
                  <div>
                    <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{item.step}</span>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-white/70 mt-1 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Contact - 3 Cards */}
        <section id="contact" className="scroll-mt-24">
          <ScrollReveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Get in Touch</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Contact & Location
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "Visit Us",
                lines: ["Main Office", "Open Mon-Fri, 8am-4pm"],
              },
              {
                icon: Mail,
                title: "Email Us",
                lines: ["General Inquiries:", "montavista@fuhsd.org", "We reply within 24 hours"],
              },
              {
                icon: Phone,
                title: "Call Us",
                lines: ["Office Phone:", "(408) 366-7600", "During office hours"],
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-neutral-800 rounded-xl p-8 border border-white/10 text-center h-full">
                  <div className="w-14 h-14 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary-500/20">
                    <item.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  {item.lines.map((line, j) => (
                    <p key={j} className={`text-sm ${j === 0 ? "text-white/40" : "text-white/70"}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
