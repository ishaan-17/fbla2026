import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getMatchesForLostItem, updateLostItemEmbedding, findMatchesForLostItem } from "@/lib/matchingService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/lost-items/[id] - Get a specific lost item with its matches
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lostItemId = parseInt(id, 10);

    if (isNaN(lostItemId)) {
      return NextResponse.json(
        { error: "Invalid lost item ID" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Get the lost item
    const { data: lostItem, error: fetchError } = await supabase
      .from("lost_items")
      .select("*")
      .eq("id", lostItemId)
      .single();

    if (fetchError || !lostItem) {
      return NextResponse.json(
        { error: "Lost item not found" },
        { status: 404 }
      );
    }

    // Get matches for this lost item
    const matches = await getMatchesForLostItem(lostItemId);

    return NextResponse.json({
      ...lostItem,
      matches,
    });
  } catch (error) {
    console.error("[api/lost-items/[id]] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lost-items/[id] - Manually trigger embedding generation and matching
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lostItemId = parseInt(id, 10);

    if (isNaN(lostItemId)) {
      return NextResponse.json(
        { error: "Invalid lost item ID" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Get the lost item
    const { data: lostItem, error: fetchError } = await supabase
      .from("lost_items")
      .select("*")
      .eq("id", lostItemId)
      .single();

    if (fetchError || !lostItem) {
      return NextResponse.json(
        { error: "Lost item not found" },
        { status: 404 }
      );
    }

    // Generate embedding if image exists
    let embeddingGenerated = false;
    if (lostItem.image_path) {
      console.log(`[api/lost-items/[id]] Generating embedding for item ${lostItemId}...`);
      embeddingGenerated = await updateLostItemEmbedding(lostItemId, lostItem.image_path);
      console.log(`[api/lost-items/[id]] Embedding generated: ${embeddingGenerated}`);
    }

    // Find matches
    console.log(`[api/lost-items/[id]] Finding matches for item ${lostItemId}...`);
    const matches = await findMatchesForLostItem(lostItemId);
    console.log(`[api/lost-items/[id]] Found ${matches.length} matches`);

    return NextResponse.json({
      success: true,
      embeddingGenerated,
      matchesFound: matches.length,
      matches,
    });
  } catch (error) {
    console.error("[api/lost-items/[id]] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lost-items/[id] - Update a lost item (e.g., mark as closed)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lostItemId = parseInt(id, 10);

    if (isNaN(lostItemId)) {
      return NextResponse.json(
        { error: "Invalid lost item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, matched_item_id } = body;

    const supabase = await createServiceClient();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (matched_item_id) updateData.matched_item_id = matched_item_id;

    const { data: updatedItem, error: updateError } = await supabase
      .from("lost_items")
      .update(updateData)
      .eq("id", lostItemId)
      .select()
      .single();

    if (updateError) {
      console.error("[api/lost-items/[id]] Error updating:", updateError);
      return NextResponse.json(
        { error: "Failed to update lost item" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[api/lost-items/[id]] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lost-items/[id] - Delete a lost item report
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lostItemId = parseInt(id, 10);

    if (isNaN(lostItemId)) {
      return NextResponse.json(
        { error: "Invalid lost item ID" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { error: deleteError } = await supabase
      .from("lost_items")
      .delete()
      .eq("id", lostItemId);

    if (deleteError) {
      console.error("[api/lost-items/[id]] Error deleting:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete lost item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/lost-items/[id]] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
