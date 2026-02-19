"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ totalReturned: 0, totalReported: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setStats(data.stats || { totalReturned: 0, totalReported: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  // Find current user's rank
  const userEmail = session?.user?.email;
  const userRankIndex = leaderboard.findIndex(
    (entry) => entry.email === userEmail,
  );
  const userEntry = userRankIndex !== -1 ? leaderboard[userRankIndex] : null;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
          Rewards Program
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Leaderboard
        </h1>
        <p className="text-white/60 mt-3 max-w-lg mx-auto">
          Earn points by finding and reporting lost items. Top contributors are
          recognized here!
        </p>
      </div>

      {/* Your Rank Card - Only shown when logged in */}
      {session && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center">
                  {userRank ? (
                    <span className="text-xl font-bold text-primary-400">
                      #{userRank}
                    </span>
                  ) : (
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                    Your Rank
                  </p>
                  <p className="text-lg font-bold text-white">
                    {session.user?.name || "Anonymous"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-white">
                  {userEntry?.total_points || 0}{" "}
                  <span className="text-sm font-medium text-white/60">pts</span>
                </p>
                <p className="text-xs text-white/50">
                  {userEntry?.items_reported || 0} items reported
                </p>
              </div>
            </div>
            {!userEntry && (
              <p className="text-xs text-white/50 mt-4 pt-4 border-t border-white/10">
                You haven&apos;t earned any points yet. Report a found item to
                get started!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-neutral-800/50 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-2xl font-extrabold text-white">+10</p>
          <p className="text-xs text-white/50 mt-1">Report item</p>
        </div>
        <div className="bg-neutral-800/50 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-2xl font-extrabold text-white">+25</p>
          <p className="text-xs text-white/50 mt-1">Item returned</p>
        </div>
        <div className="bg-neutral-800/50 border border-white/10 rounded-xl p-5 text-center">
          <p className="text-2xl font-extrabold text-primary-400">
            {stats.totalReturned}
          </p>
          <p className="text-xs text-white/50 mt-1">Total returned</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="bg-neutral-800/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Leaderboard rankings</caption>
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4 w-16"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="text-center text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                  >
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry, i) => {
                  const isCurrentUser = entry.email === userEmail;
                  return (
                    <tr
                      key={entry.email}
                      className={`transition-colors ${
                        isCurrentUser
                          ? "bg-primary-500/20 border-l-2 border-l-primary-500"
                          : i < 3
                            ? "bg-white/5"
                            : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-extrabold ${
                            i === 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : i === 1
                                ? "bg-gray-400/20 text-gray-300"
                                : i === 2
                                  ? "bg-amber-600/20 text-amber-500"
                                  : "bg-white/10 text-white/60"
                          }`}
                        >
                          {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${isCurrentUser ? "text-primary-300" : "text-white"}`}
                          >
                            {entry.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-white/60">
                        {entry.items_reported}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-extrabold ${isCurrentUser ? "text-primary-400" : i === 0 ? "text-yellow-400" : "text-white"}`}
                        >
                          {entry.total_points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-neutral-800/30 border border-white/10 rounded-xl">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No one on the leaderboard yet
          </h2>
          <p className="text-white/50">
            Be the first to earn points by reporting a found item!
          </p>
        </div>
      )}
    </div>
  );
}
