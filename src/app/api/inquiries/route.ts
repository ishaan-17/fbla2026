import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Inquiry, InquiryWithItem, Item } from "@/types";

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
      .from("inquiries")
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
      console.error("Error fetching inquiries:", error);
      return NextResponse.json(
        { error: "Failed to fetch inquiries" },
        { status: 500 },
      );
    }

    // Transform the data to match InquiryWithItem type
    const inquiries = (data || []).map((inquiry: any) => ({
      ...inquiry,
      item_title: inquiry.items?.title || "",
    }));

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_id, inquirer_name, inquirer_email, message } = body;

    if (!item_id || !message) {
      return NextResponse.json(
        { error: "Item ID and message are required" },
        { status: 400 },
      );
    }

    const supabase = await createServiceClient();

    // Check item exists
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { data: inquiry, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        item_id,
        inquirer_name,
        inquirer_email,
        message,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating inquiry:", insertError);
      return NextResponse.json(
        { error: "Failed to submit inquiry" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}
