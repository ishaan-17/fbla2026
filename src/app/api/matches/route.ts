import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/matches - Get matches (optionally filtered by lost_item_id or found_item_id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lostItemId = searchParams.get("lost_item_id");
    const foundItemId = searchParams.get("found_item_id");
    const status = searchParams.get("status");

    const supabase = await createServiceClient();

    let query = supabase
      .from("item_matches")
      .select(`
        *,
        lost_items:lost_item_id (
          id,
          title,
          description,
          category,
          image_path,
          reporter_email,
          reporter_name,
          location_lost,
          date_lost
        ),
        items:found_item_id (
          id,
          title,
          description,
          category,
          image_path,
          location_found,
          date_found
        )
      `)
      .order("total_score", { ascending: false });

    if (lostItemId) {
      query = query.eq("lost_item_id", parseInt(lostItemId, 10));
    }

    if (foundItemId) {
      query = query.eq("found_item_id", parseInt(foundItemId, 10));
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[api/matches] Error fetching matches:", error);
      return NextResponse.json(
        { error: "Failed to fetch matches" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/matches] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/matches - Update match status (confirm/reject)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { match_id, status } = body;

    if (!match_id || !status) {
      return NextResponse.json(
        { error: "match_id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "notified", "confirmed", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { data: match, error: updateError } = await supabase
      .from("item_matches")
      .update({ status })
      .eq("id", match_id)
      .select()
      .single();

    if (updateError) {
      console.error("[api/matches] Error updating match:", updateError);
      return NextResponse.json(
        { error: "Failed to update match" },
        { status: 500 }
      );
    }

    // If confirmed, update the lost item status
    if (status === "confirmed" && match) {
      await supabase
        .from("lost_items")
        .update({
          status: "matched",
          matched_item_id: match.found_item_id,
        })
        .eq("id", match.lost_item_id);
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("[api/matches] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
