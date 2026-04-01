import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Item } from "@/types";
import { unlink } from "fs/promises";
import path from "path";
import { findMatchesForFoundItem } from "@/lib/matchingService";
import { sendMatchNotificationEmail } from "@/lib/emailService";
import type { Database } from "@/lib/supabase/database.types";

type FoundItem = Database["public"]["Tables"]["items"]["Row"];

interface MatchWithFoundItem {
  id: number;
  total_score: number;
  found_item_id: number;
  items: FoundItem;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    const { data: item, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (error || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    const body = await request.json();

    const allowedFields = ["title", "description", "category", "status"];
    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Check if this is an approval (status changing to "approved")
    const isApproval = updates.status === "approved";
    
    // Get current status to see if it's actually changing
    let wasNotApproved = true;
    if (isApproval) {
      const { data: currentItem } = await supabase
        .from("items")
        .select("status")
        .eq("id", itemId)
        .single();
      wasNotApproved = currentItem?.status !== "approved";
    }

    const { data: item, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating item:", error);
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }

    // If item was just approved, run matching against lost items
    if (isApproval && wasNotApproved && item) {
      console.log(`[items/[id]] Item ${itemId} approved, running matching...`);
      findMatchesForFoundItem(itemId)
        .then(async (matches) => {
          console.log(`[items/[id]] Found ${matches.length} matches for approved item ${itemId}`);
          
          if (matches.length === 0) return;

          // Group matches by lost_item_id
          const matchesByLostItem = new Map<number, typeof matches>();
          for (const match of matches) {
            if (!matchesByLostItem.has(match.lostItemId)) {
              matchesByLostItem.set(match.lostItemId, []);
            }
            matchesByLostItem.get(match.lostItemId)!.push(match);
          }

          // Send email to each lost item owner
          for (const [lostItemId, lostItemMatches] of matchesByLostItem.entries()) {
            try {
              // Fetch lost item details
              const { data: lostItem } = await supabase
                .from("lost_items")
                .select("*")
                .eq("id", lostItemId)
                .single();

              if (!lostItem) continue;

              // Fetch match details with found items
              const matchIds = lostItemMatches.map(m => m.foundItemId);
              const { data: matchesWithDetails } = await supabase
                .from("item_matches")
                .select(`
                  id,
                  total_score,
                  found_item_id,
                  items:found_item_id (*)
                `)
                .eq("lost_item_id", lostItemId)
                .in("found_item_id", matchIds);

              if (matchesWithDetails && matchesWithDetails.length > 0) {
                // Send email
                const emailSent = await sendMatchNotificationEmail(
                  lostItem, 
                  matchesWithDetails as unknown as MatchWithFoundItem[]
                );

                if (emailSent) {
                  // Mark matches as notified
                  const matchIdsToUpdate = matchesWithDetails.map(m => m.id);
                  await supabase
                    .from("item_matches")
                    .update({ notified_at: new Date().toISOString() })
                    .in("id", matchIdsToUpdate);

                  console.log(`[items/[id]] Email sent to ${lostItem.reporter_email} for ${matchIdsToUpdate.length} matches`);
                }
              }
            } catch (emailError) {
              console.error(`[items/[id]] Error sending email for lost item ${lostItemId}:`, emailError);
            }
          }
        })
        .catch((err) => {
          console.error(`[items/[id]] Matching error for item ${itemId}:`, err);
        });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createServiceClient();

    const { data: item, error: fetchError } = await supabase
      .from("items")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete image file if it exists
    if (item.image_path) {
      try {
        await unlink(path.join(process.cwd(), "public", item.image_path));
      } catch {
        // Image already deleted or missing, ignore
      }
    }

    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", parseInt(id, 10));

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
