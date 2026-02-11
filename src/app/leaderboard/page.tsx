"use client";

import { useState, useEffect } from "react";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
          Rewards Program
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Leaderboard
        </h1>
        <p className="text-earth-100 mt-3 max-w-lg mx-auto">
          Earn points by finding and reporting lost items. Get bonus points when the item is successfully returned!
        </p>
      </div>

      {/* Points Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-earth-200 mb-14">
        <div className="bg-earth-50 p-6 text-center">
          <p className="text-3xl font-extrabold text-earth-900">+10</p>
          <p className="text-xs text-earth-500 mt-1 font-medium">Report a found item</p>
        </div>
        <div className="bg-earth-50 p-6 text-center">
          <p className="text-3xl font-extrabold text-earth-900">+25</p>
          <p className="text-xs text-earth-500 mt-1 font-medium">Item returned to owner</p>
        </div>
        <div className="bg-earth-50 p-6 text-center">
          <p className="text-3xl font-extrabold text-primary-500">{stats.totalReturned}</p>
          <p className="text-xs text-earth-500 mt-1 font-medium">Total items returned</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-earth-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="bg-white border border-earth-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4 w-16">Rank</th>
                  <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Name</th>
                  <th className="text-center text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Items Reported</th>
                  <th className="text-right text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.email}
                    className={`transition-colors ${i < 3 ? "bg-primary-50/40" : "hover:bg-earth-50"}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 text-sm font-extrabold ${
                        i === 0
                          ? "bg-accent-400 text-earth-900"
                          : i === 1
                          ? "bg-earth-300 text-earth-800"
                          : i === 2
                          ? "bg-primary-300 text-earth-900"
                          : "bg-earth-100 text-earth-600"
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-semibold ${i < 3 ? "text-earth-900" : "text-earth-700"}`}>
                        {entry.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-earth-600">
                      {entry.items_reported}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-extrabold ${i === 0 ? "text-primary-500" : "text-earth-700"}`}>
                        {entry.total_points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-24">
          <h2 className="text-xl font-bold text-earth-100 mb-2">No one on the leaderboard yet</h2>
          <p className="text-earth-100">Be the first to earn points by reporting a found item!</p>
        </div>
      )}
    </div>
  );
}
