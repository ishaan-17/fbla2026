import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { findMatchesForLostItem, updateLostItemEmbedding } from "@/lib/matchingService";
import { sendMatchNotificationEmail } from "@/lib/emailService";
import type { Database } from "@/lib/supabase/database.types";

type FoundItem = Database["public"]["Tables"]["items"]["Row"];

interface MatchWithFoundItem {
  id: number;
  total_score: number;
  found_item_id: number;
  items: FoundItem;
}

/**
 * GET /api/lost-items - List lost items (optionally filtered by email)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const status = searchParams.get("status");

    const supabase = await createServiceClient();

    let query = supabase
      .from("lost_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("reporter_email", email);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[api/lost-items] Error fetching lost items:", error);
      return NextResponse.json(
        { error: "Failed to fetch lost items" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/lost-items] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lost-items - Submit a new lost item report
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      category,
      location_lost,
      date_lost,
      image_path,
      image_embedding,
      ai_tags,
      reporter_name,
      reporter_email,
    } = body;

    // Validate required fields
    if (!title || !description || !reporter_email) {
      return NextResponse.json(
        { error: "Title, description, and email are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Format embedding as PostgreSQL vector literal if provided
    const embeddingValue = image_embedding 
      ? `[${image_embedding.join(",")}]` as unknown as number[]
      : null;

    // Insert the lost item
    const { data: lostItem, error: insertError } = await supabase
      .from("lost_items")
      .insert({
        title,
        description,
        category: category || "other",
        location_lost,
        date_lost,
        image_path,
        image_embedding: embeddingValue,
        ai_tags,
        reporter_name,
        reporter_email,
        status: "searching",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/lost-items] Error inserting lost item:", insertError);
      return NextResponse.json(
        { error: "Failed to submit lost item report" },
        { status: 500 }
      );
    }

    // Find matches asynchronously (embedding already included if provided)
    findMatchesForLostItem(lostItem.id)
      .then(async (matches) => {
        console.log(`[api/lost-items] Found ${matches.length} matches for item ${lostItem.id}`);
        
        if (matches.length === 0) return;

        try {
          // Fetch match details with found items
          const matchIds = matches.map(m => m.foundItemId);
          const { data: matchesWithDetails } = await supabase
            .from("item_matches")
            .select(`
              id,
              total_score,
              found_item_id,
              items:found_item_id (*)
            `)
            .eq("lost_item_id", lostItem.id)
            .in("found_item_id", matchIds);

          if (matchesWithDetails && matchesWithDetails.length > 0) {
            // Send email to submitter
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

              console.log(`[api/lost-items] Email sent to ${lostItem.reporter_email} for ${matchIdsToUpdate.length} matches`);
            }
          }
        } catch (emailError) {
          console.error("[api/lost-items] Error sending email:", emailError);
        }
      })
      .catch((err) => {
        console.error("[api/lost-items] Background matching error:", err);
      });

    return NextResponse.json({
      success: true,
      item: lostItem,
      message: "Lost item report submitted. We'll notify you if we find matches!",
    });
  } catch (error) {
    console.error("[api/lost-items] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
