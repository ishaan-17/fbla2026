import { NextResponse } from "next/server";
import db from "@/lib/db";
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

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (status) {
      whereClause += " AND inq.status = ?";
      params.push(status);
    }

    if (itemId) {
      whereClause += " AND inq.item_id = ?";
      params.push(parseInt(itemId));
    }

    const inquiries = db
      .prepare(
        `SELECT inq.*, i.title as item_title
         FROM inquiries inq
         JOIN items i ON inq.item_id = i.id
         ${whereClause}
         ORDER BY inq.created_at DESC`
      )
      .all(...params) as InquiryWithItem[];

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item_id, inquirer_name, inquirer_email, message } = body;

    if (!item_id || !inquirer_name || !inquirer_email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquirer_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check item exists
    const item = db
      .prepare("SELECT * FROM items WHERE id = ?")
      .get(item_id) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const result = db
      .prepare(
        `INSERT INTO inquiries (item_id, inquirer_name, inquirer_email, message)
         VALUES (?, ?, ?, ?)`
      )
      .run(item_id, inquirer_name, inquirer_email, message);

    const inquiry = db
      .prepare("SELECT * FROM inquiries WHERE id = ?")
      .get(result.lastInsertRowid) as Inquiry;

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
