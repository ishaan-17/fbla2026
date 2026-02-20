import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get("category") || "";
    const status = url.searchParams.get("status") || "approved";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const serviceClient = await createServiceClient();

    let query = serviceClient
      .from("items")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: items, error, count } = await query;

    if (error) {
      console.error("Error fetching items from Supabase:", error);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      items: items || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in analytics GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      location_found,
      date_found,
      image_path,
      ai_tags,
      reporter_name,
      reporter_email,
    } = body;

    if (!title || !description || !location_found || !date_found) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();

    const { data: item, error: insertError } = await serviceClient
      .from("items")
      .insert({
        title,
        description,
        category: category || "other",
        location_found,
        date_found,
        image_path: image_path || null,
        ai_tags: ai_tags ? JSON.stringify(ai_tags) : null,
        reporter_name: reporter_name || "",
        reporter_email: reporter_email || "",
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting item into Supabase:", insertError);
      return NextResponse.json(
        { error: "Failed to create item" },
        { status: 500 },
      );
    }

    // Award 10 points for reporting a found item
    if (reporter_email && item) {
      const { error: rewardError } = await serviceClient
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
    console.error("Error in analytics POST:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
