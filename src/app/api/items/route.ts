import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Item } from "@/types";
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const status = url.searchParams.get("status") || "approved";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const all = url.searchParams.get("all") === "true";
    const reporterEmail = url.searchParams.get("reporter_email") || "";
    const offset = (page - 1) * limit;

    const supabase = await createServiceClient();

    let query = supabase
      .from("items")
      .select("*", { count: "exact" });

    if (!all) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (reporterEmail) {
      query = query.eq("reporter_email", reporterEmail);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,ai_tags.ilike.%${search}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error("Error fetching items:", error);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: items || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, location_found, date_found, image_path, image_embedding, ai_tags, reporter_name, reporter_email, auto_approve } = body;

    if (!title || !description || !location_found || !date_found) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Auto-approve if user is admin (verify server-side)
    const adminUser = await isAdmin();
    const status = (auto_approve && adminUser) ? "approved" : "pending";

    const supabase = await createServiceClient();

    // Format embedding as PostgreSQL vector literal if provided
    const embeddingValue = image_embedding 
      ? `[${image_embedding.join(",")}]` as unknown as number[]
      : null;

    const { data: item, error: insertError } = await supabase
      .from("items")
      .insert({
        title,
        description,
        category: category || "other",
        location_found,
        date_found,
        image_path: image_path || null,
        image_embedding: embeddingValue,
        ai_tags: ai_tags || null,
        reporter_name: reporter_name || "",
        reporter_email: reporter_email || "",
        status,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating item:", insertError);
      return NextResponse.json(
        { error: "Failed to create item" },
        { status: 500 }
      );
    }

    // Award 10 points for reporting a found item
    if (reporter_email && item) {
      const { error: rewardError } = await supabase
        .from("rewards")
        .insert({
          email: reporter_email,
          name: reporter_name || "Anonymous",
          points: 10,
          reason: "Reported a found item",
          item_id: item.id,
        });

      if (rewardError) {
        console.error("Error awarding points:", rewardError);
      }
    }

    // If auto-approved (admin submitted), run matching immediately
    if (status === "approved" && item) {
      console.log(`[items] Admin-approved item ${item.id}, running matching...`);
      findMatchesForFoundItem(item.id)
        .then(async (matches) => {
          console.log(`[items] Found ${matches.length} matches for item ${item.id}`);
          
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

                  console.log(`[items] Email sent to ${lostItem.reporter_email} for ${matchIdsToUpdate.length} matches`);
                }
              }
            } catch (emailError) {
              console.error(`[items] Error sending email for lost item ${lostItemId}:`, emailError);
            }
          }
        })
        .catch((err) => {
          console.error(`[items] Matching error for item ${item.id}:`, err);
        });
    }

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
