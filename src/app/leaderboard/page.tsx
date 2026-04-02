"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, TrendingUp, Crown } from "lucide-react";
import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/types";
import CountUp from "@/components/ui/count-up";
import { Sparkles } from "@/components/ui/sparkles";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";

// Demo users with real portrait photos from randomuser.me
const DEMO_USERS: (LeaderboardEntry & { isDemo: boolean })[] = [
  { email: "__demo_1__", name: "Sarah Chen",     total_points: 115, items_reported: 5, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/women/44.jpg" },
  { email: "__demo_2__", name: "Marcus Johnson", total_points: 90,  items_reported: 4, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/men/32.jpg" },
  { email: "__demo_3__", name: "Priya Patel",    total_points: 75,  items_reported: 3, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/women/75.jpg" },
  { email: "__demo_4__", name: "Tyler Brooks",   total_points: 55,  items_reported: 2, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/men/51.jpg" },
  { email: "__demo_5__", name: "Aisha Williams", total_points: 35,  items_reported: 2, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/women/89.jpg" },
  { email: "__demo_6__", name: "Kevin Nguyen",   total_points: 20,  items_reported: 1, isDemo: true, avatar_url: "https://randomuser.me/api/portraits/men/16.jpg" },
];

function getAvatar(name: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  const seed = encodeURIComponent(name.trim());
  return `https://api.dicebear.com/9.x/initials/png?seed=${seed}&backgroundColor=627d98,486581,334e68,243b53&textColor=ffffff&fontSize=38&fontWeight=700&size=128`;
}

const rankMedal = {
  1: {
    ring: "ring-4 ring-yellow-400/80 shadow-[0_0_28px_rgba(251,191,36,0.65)]",
    badge: "bg-yellow-400 text-yellow-950",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.22)]",
    cardOverlay: "bg-gradient-to-b from-yellow-400/10 via-yellow-500/5 to-transparent",
    accent: "text-yellow-300",
    border: "border border-yellow-400/20",
  },
  2: {
    ring: "ring-4 ring-slate-300/70 shadow-[0_0_20px_rgba(203,213,225,0.45)]",
    badge: "bg-slate-300 text-slate-900",
    glow: "shadow-[0_0_40px_rgba(203,213,225,0.12)]",
    cardOverlay: "bg-gradient-to-b from-slate-300/8 via-slate-400/4 to-transparent",
    accent: "text-slate-300",
    border: "border border-slate-300/15",
  },
  3: {
    ring: "ring-4 ring-orange-400/60 shadow-[0_0_20px_rgba(251,146,60,0.4)]",
    badge: "bg-orange-500 text-orange-950",
    glow: "shadow-[0_0_40px_rgba(251,146,60,0.12)]",
    cardOverlay: "bg-gradient-to-b from-orange-500/8 via-orange-600/4 to-transparent",
    accent: "text-orange-300",
    border: "border border-orange-400/15",
  },
};

const ORBS = [
  { x: "10%",  y: "20%", size: 320, color: "rgba(98,125,152,0.07)",  delay: 0 },
  { x: "75%",  y: "10%", size: 280, color: "rgba(245,166,35,0.05)",  delay: 1.5 },
  { x: "60%",  y: "60%", size: 400, color: "rgba(98,125,152,0.06)",  delay: 0.8 },
  { x: "20%",  y: "70%", size: 240, color: "rgba(72,101,129,0.07)",  delay: 2.2 },
  { x: "85%",  y: "80%", size: 200, color: "rgba(245,166,35,0.04)",  delay: 1 },
];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [rawLeaderboard, setRawLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => res.json())
      .then((data) => setRawLeaderboard(data.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);

  const leaderboard = [...rawLeaderboard, ...DEMO_USERS].sort(
    (a, b) => b.total_points - a.total_points
  );

  const userEmail = session?.user?.email?.toLowerCase().trim();
  const userRankIndex = leaderboard.findIndex((e) => e.email.toLowerCase().trim() === userEmail);
  const userEntry = userRankIndex !== -1 ? leaderboard[userRankIndex] : null;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podium = [
    { entry: top3[1], rank: 2 },
    { entry: top3[0], rank: 1 },
    { entry: top3[2], rank: 3 },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Fixed background layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <Sparkles
          className="w-full h-full absolute inset-0"
          density={60}
          size={1.2}
          minSize={0.4}
          speed={0.4}
          minSpeed={0.1}
          opacity={0.5}
          minOpacity={0.1}
          color="#a0b4c8"
        />
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.08, 0.95, 1] }}
            transition={{ duration: 12 + i * 2, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 rounded-full px-4 py-1.5 mb-4">
            <Trophy className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">Rewards Program</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Leaderboard
          </h1>
          <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
            Earn points by finding and reporting lost items.
            Top contributors are recognized here.
          </p>
        </motion.div>

        {/* ── Your Rank ── */}
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-10"
          >
            <LiquidGlassCard
              draggable={false}
              borderRadius="20px"
              blurIntensity="lg"
              glowIntensity="sm"
              shadowIntensity="sm"
              turbulence="medium"
            >
              <div className="relative overflow-hidden p-5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                      userRank
                        ? "bg-primary-500/25 border border-primary-500/40 text-primary-300"
                        : "bg-white/10 border border-white/15 text-white/40"
                    }`}>
                      {userRank ? `#${userRank}` : <TrendingUp className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-0.5">Your Standing</p>
                      <p className="font-bold text-white">{session.user?.name || "Anonymous"}</p>
                      <p className="text-xs text-white/35">{userEntry?.items_reported ?? 0} items reported</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-white tabular-nums">
                      <CountUp to={userEntry?.total_points ?? 0} duration={1.5} />
                    </p>
                    <p className="text-xs text-white/35">points</p>
                  </div>
                </div>
                {!userEntry && (
                  <p className="text-xs text-white/25 mt-4 pt-4 border-t border-white/8">
                    Report a found item to earn points and appear on the leaderboard!
                  </p>
                )}
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            <div className="mb-10">
              <p className="text-center text-[10px] font-bold text-white/25 uppercase tracking-widest mb-8">
                Top Contributors
              </p>
              <div className="flex items-end justify-center gap-3 sm:gap-5 pt-16">
                {podium.map(({ entry, rank }, idx) => {
                  if (!entry) return <div key={idx} className="flex-1 max-w-[180px]" />;
                  const medal = rankMedal[rank as 1 | 2 | 3];
                  const isFirst = rank === 1;
                  const isCurrentUser = entry.email.toLowerCase().trim() === userEmail;
                  const avatarSrc =
                    isCurrentUser && session?.user?.image
                      ? session.user.image
                      : getAvatar(entry.name, entry.avatar_url);

                  return (
                    <motion.div
                      key={entry.email}
                      initial={{ opacity: 0, y: 48 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 + idx * 0.08, type: "spring", stiffness: 120 }}
                      className={`flex-1 max-w-[180px] flex flex-col items-center ${!isFirst ? "mb-6" : ""}`}
                    >
                      {/* Avatar — floats above card */}
                      <div className="relative z-10">
                        {isFirst && (
                          <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] z-20" />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarSrc}
                          alt={entry.name}
                          className={`rounded-full object-cover ${medal.ring} ${isFirst ? "w-20 h-20" : "w-16 h-16"}`}
                        />
                        <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ring-white/10 ${medal.badge}`}>
                          {rank}
                        </span>
                      </div>

                      {/* Glass card below avatar */}
                      <div className={`-mt-10 w-full ${medal.glow}`}>
                        <LiquidGlassCard
                          draggable={false}
                          borderRadius="18px"
                          blurIntensity="xl"
                          glowIntensity="sm"
                          shadowIntensity="sm"
                          turbulence="liquid"
                          className={medal.border}
                        >
                          {/* Rank color tint overlay */}
                          <div className={`absolute inset-0 rounded-[18px] z-0 pointer-events-none ${medal.cardOverlay}`} />
                          <div className={`relative text-center ${isFirst ? "pt-14 pb-6 px-4" : "pt-11 pb-5 px-3"}`}>
                            <p className={`font-bold text-white leading-tight truncate ${isFirst ? "text-base" : "text-sm"}`}>
                              {entry.name}
                            </p>
                            <p className={`font-extrabold tabular-nums mt-1 ${medal.accent} ${isFirst ? "text-2xl" : "text-xl"}`}>
                              <CountUp to={entry.total_points} duration={1.2} />
                            </p>
                            <p className="text-[10px] text-white/35 mt-0.5">
                              {entry.items_reported} item{entry.items_reported !== 1 ? "s" : ""} found
                            </p>
                          </div>
                        </LiquidGlassCard>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Rankings Table ── */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <LiquidGlassCard
                  draggable={false}
                  borderRadius="20px"
                  blurIntensity="lg"
                  glowIntensity="xs"
                  shadowIntensity="xs"
                  turbulence="medium"
                  className="overflow-hidden"
                >
                  <div
                    className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Rankings</h2>
                    <span className="text-xs text-white/20">{rest.length} more</span>
                  </div>
                  <div>
                    {rest.map((entry, i) => {
                      const rank = i + 4;
                      const isCurrentUser = entry.email.toLowerCase().trim() === userEmail;
                      const isDemo = "isDemo" in entry && (entry as { isDemo: boolean }).isDemo;
                      const avatarSrc =
                        isCurrentUser && session?.user?.image
                          ? session.user.image
                          : getAvatar(entry.name, entry.avatar_url);

                      return (
                        <motion.div
                          key={entry.email}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.45 + i * 0.04 }}
                          className={`flex items-center gap-4 px-5 py-4 border-b border-white/[0.05] last:border-0 transition-all duration-200 group ${
                            isCurrentUser ? "bg-primary-800/20" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Rank */}
                          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 text-white/40 text-sm font-bold flex-shrink-0 tabular-nums group-hover:bg-white/12 transition-colors">
                            {rank}
                          </span>

                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/15">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatarSrc}
                              alt={entry.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate text-sm ${isCurrentUser ? "text-primary-300" : "text-white/90"}`}>
                                {entry.name}
                              </p>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold text-primary-400 bg-primary-500/20 px-1.5 py-0.5 rounded flex-shrink-0">
                                  YOU
                                </span>
                              )}
                              {isDemo && (
                                <span className="text-[10px] font-medium text-white/20 flex-shrink-0">demo</span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/30 mt-0.5">{entry.items_reported} items reported</p>
                          </div>

                          {/* Points */}
                          <span className={`text-sm font-extrabold flex-shrink-0 tabular-nums ${
                            isCurrentUser ? "text-primary-400" : "text-white/70"
                          }`}>
                            {entry.total_points} <span className="font-medium text-white/25 text-xs">pts</span>
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
