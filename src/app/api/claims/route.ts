import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Claim, ClaimWithItem, Item } from "@/types";

export async function GET(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const itemId = url.searchParams.get("item_id") || "";

    const supabase = await createServiceClient();

    let query = supabase
      .from("claims")
      .select(`
        *,
        items (
          title
        )
      `);

    if (status) {
      query = query.eq("status", status);
    }

    if (itemId) {
      query = query.eq("item_id", parseInt(itemId));
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching claims:", error);
      return NextResponse.json(
        { error: "Failed to fetch claims" },
        { status: 500 },
      );
    }

    // Transform the data to match ClaimWithItem type
    const claims = (data || []).map((claim: any) => ({
      ...claim,
      item_title: claim.items?.title || "",
    }));

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_id, claimant_name, claimant_email, claimant_description } =
      body;

    if (!item_id || !claimant_description) {
      return NextResponse.json(
        { error: "Item ID and description are required" },
        { status: 400 },
      );
    }

    const supabase = await createServiceClient();

    // Check item exists and is approved
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.status !== "approved") {
      return NextResponse.json(
        { error: "This item is not available for claiming" },
        { status: 400 },
      );
    }

    const { data: claim, error: insertError } = await supabase
      .from("claims")
      .insert({
        item_id,
        claimant_name,
        claimant_email,
        claimant_description,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating claim:", insertError);
      return NextResponse.json(
        { error: "Failed to submit claim" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 },
    );
  }
}
