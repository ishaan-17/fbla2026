import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    // Get leaderboard data from rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("rewards")
      .select("email, name, points, item_id");

    if (rewardsError) {
      console.error("Error fetching rewards:", rewardsError);
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      );
    }

    // Aggregate rewards by email
    const leaderboardMap = new Map<string, LeaderboardEntry>();
    
    for (const reward of rewards || []) {
      const existing = leaderboardMap.get(reward.email);
      if (existing) {
        existing.total_points += reward.points;
        if (reward.item_id) {
          existing.items_reported += 1;
        }
      } else {
        leaderboardMap.set(reward.email, {
          email: reward.email,
          name: reward.name,
          total_points: reward.points,
          items_reported: reward.item_id ? 1 : 0,
        });
      }
    }

    const leaderboard = Array.from(leaderboardMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 50);

    // Get stats
    const { count: totalReturned, error: returnedError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("status", "claimed");

    const { count: totalReported, error: reportedError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });

    if (returnedError || reportedError) {
      console.error("Error fetching stats:", returnedError || reportedError);
    }

    return NextResponse.json({
      leaderboard,
      stats: {
        totalReturned: totalReturned || 0,
        totalReported: totalReported || 0,
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
