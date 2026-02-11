import { NextResponse } from "next/server";
import db from "@/lib/db";
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

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (status) {
      whereClause += " AND c.status = ?";
      params.push(status);
    }

    if (itemId) {
      whereClause += " AND c.item_id = ?";
      params.push(parseInt(itemId));
    }

    const claims = db
      .prepare(
        `SELECT c.*, i.title as item_title
         FROM claims c
         JOIN items i ON c.item_id = i.id
         ${whereClause}
         ORDER BY c.created_at DESC`
      )
      .all(...params) as ClaimWithItem[];

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_id, claimant_name, claimant_email, claimant_description } =
      body;

    if (!item_id || !claimant_name || !claimant_email || !claimant_description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(claimant_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check item exists and is approved
    const item = db
      .prepare("SELECT * FROM items WHERE id = ?")
      .get(item_id) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.status !== "approved") {
      return NextResponse.json(
        { error: "This item is not available for claiming" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO claims (item_id, claimant_name, claimant_email, claimant_description)
         VALUES (?, ?, ?, ?)`
      )
      .run(item_id, claimant_name, claimant_email, claimant_description);

    const claim = db
      .prepare("SELECT * FROM claims WHERE id = ?")
      .get(result.lastInsertRowid) as Claim;

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}
