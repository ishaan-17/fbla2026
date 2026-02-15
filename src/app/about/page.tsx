"use client";

import Link from "next/link";
import { Camera, Users, Trophy, Heart, MapPin, Mail, Phone, Search, AlertCircle, Gift, Clock, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";

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
      className={`hidden xl:block fixed top-32 w-48 bg-earth-800/90 backdrop-blur-sm rounded-xl p-4 border border-earth-700 transition-opacity duration-300 ${
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
                <span className="w-5 flex-shrink-0 text-earth-500 text-xs">
                  {index + 1}
                </span>
              )}
              <span className={`text-xs transition-colors ${
                isActive 
                  ? "font-semibold text-white" 
                  : "font-normal text-earth-400 hover:text-earth-300"
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
        <p className="text-earth-400 mt-4 max-w-2xl mx-auto text-lg">
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
            <p className="text-earth-300 leading-relaxed mb-4">
              Our Lost & Found platform is built to help our school community reunite with their belongings quickly and efficiently. Powered by <strong className="text-white">AI image recognition</strong>, the system automatically categorizes found items to make searching easier.
            </p>
            <p className="text-earth-300 leading-relaxed">
              We reward students who take the time to report items they find, building a culture of <strong className="text-white">kindness and responsibility</strong>.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: "AI Recognition" },
                  { icon: Users, label: "Community Driven" },
                  { icon: Trophy, label: "Rewards System" },
                  { icon: Heart, label: "Give Back" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center text-center border border-white/20">
                    <item.icon className="w-8 h-8 text-white/80 mb-3" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 30-Day Donation Policy - Bento Cards */}
        <section id="policy" className="scroll-mt-24">
          <ScrollReveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Donation Policy</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              30-Day Donation Policy
            </h2>
            <p className="text-earth-400 max-w-2xl mx-auto">
              To keep our lost and found system manageable and give items the best chance of being useful, we have a 30-day policy on all unclaimed items.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                color: "bg-cyan-500",
                iconBg: "bg-cyan-500",
                icon: Search,
                badge: "Days 1-14",
                title: "Active Listing",
                desc: "Items are actively listed and available for claiming. Full search and claim functionality.",
              },
              {
                color: "bg-sky-600",
                iconBg: "bg-sky-600",
                icon: AlertCircle,
                badge: "Days 15-30",
                title: "Expiring Soon",
                desc: "Items are marked as \"expiring soon\" with a visible countdown. Last chance to claim!",
              },
              {
                color: "bg-primary-500",
                iconBg: "bg-primary-500",
                icon: Gift,
                badge: "After 30 Days",
                title: "Donated to Charity",
                desc: "Unclaimed items are donated to local charities to benefit those in need. Nothing goes to waste!",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-earth-800 rounded-xl overflow-hidden border border-earth-700 h-full">
                  <div className={`h-1.5 ${item.color}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-earth-700 rounded-full mb-4">
                      <Clock className="w-3 h-3 text-earth-400" />
                      <span className="text-xs font-semibold text-earth-300">{item.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-earth-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <p className="text-center text-sm text-earth-500 mt-8 max-w-2xl mx-auto">
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
              <p className="text-earth-300 leading-relaxed mb-6">
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

          <div className="space-y-5">
            <ScrollReveal delay={0}>
              <div className="bg-gradient-to-br from-earth-800 to-earth-900 rounded-xl p-6 border border-earth-700">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">+10 Points</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Report a Found Item</h3>
                    <p className="text-sm text-earth-400">Earned when you submit a report with your information. Help someone find their belongings!</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-gradient-to-br from-cyan-900/50 to-earth-900 rounded-xl p-6 border border-cyan-800/50">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">+25 Points</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Item Successfully Returned</h3>
                    <p className="text-sm text-earth-400">Bonus points when the item you found is claimed and verified by the owner.</p>
                  </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Report a Found Item",
                desc: "Found something on campus? Take a photo and submit a report. Our AI will automatically categorize the item.",
                color: "from-primary-500/20 to-transparent",
              },
              {
                step: "02",
                title: "Admin Review",
                desc: "An administrator reviews submitted reports to ensure they are genuine and appropriately categorized.",
                color: "from-cyan-500/20 to-transparent",
              },
              {
                step: "03",
                title: "Search & Claim",
                desc: "Lost something? Browse the listings or search by keyword. When you find your item, submit a claim.",
                color: "from-sky-500/20 to-transparent",
              },
              {
                step: "04",
                title: "Verification & Collection",
                desc: "An admin verifies your claim. Once verified, collect your item and the finder earns bonus points!",
                color: "from-indigo-500/20 to-transparent",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div className={`bg-gradient-to-br ${item.color} bg-earth-800/50 rounded-xl p-6 border border-earth-700 h-full`}>
                  <span className="text-5xl font-extrabold text-earth-700">{item.step}</span>
                  <h3 className="text-lg font-bold text-white mt-4 mb-2">{item.title}</h3>
                  <p className="text-sm text-earth-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
                lines: ["Lost & Found Office", "Building A, Room 102", "Open Mon-Fri, 8am-4pm"],
              },
              {
                icon: Mail,
                title: "Email Us",
                lines: ["General Inquiries:", "lostandfound@school.edu", "We reply within 24 hours"],
              },
              {
                icon: Phone,
                title: "Call Us",
                lines: ["Office Phone:", "(555) 123-4567", "During office hours"],
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-earth-800 rounded-xl p-8 border border-earth-700 text-center h-full">
                  <div className="w-14 h-14 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary-500/20">
                    <item.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  {item.lines.map((line, j) => (
                    <p key={j} className={`text-sm ${j === 0 ? "text-earth-500" : "text-earth-300"}`}>
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
