import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { LeaderboardEntry } from "@/types";

export async function GET() {
  try {
    const leaderboard = db
      .prepare(
        `SELECT
          email,
          name,
          SUM(points) as total_points,
          COUNT(DISTINCT item_id) as items_reported
         FROM rewards
         GROUP BY email
         ORDER BY total_points DESC
         LIMIT 50`
      )
      .all() as LeaderboardEntry[];

    const totalReturned = db
      .prepare("SELECT COUNT(*) as count FROM items WHERE status = 'claimed'")
      .get() as { count: number };

    const totalReported = db
      .prepare("SELECT COUNT(*) as count FROM items")
      .get() as { count: number };

    return NextResponse.json({
      leaderboard,
      stats: {
        totalReturned: totalReturned.count,
        totalReported: totalReported.count,
      },
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}
