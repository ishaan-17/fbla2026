import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Item } from "@/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const status = url.searchParams.get("status") || "approved";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const all = url.searchParams.get("all") === "true";
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
    const { title, description, category, location_found, date_found, image_path, ai_tags, reporter_name, reporter_email, auto_approve } = body;

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

    const { data: item, error: insertError } = await supabase
      .from("items")
      .insert({
        title,
        description,
        category: category || "other",
        location_found,
        date_found,
        image_path: image_path || null,
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

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
