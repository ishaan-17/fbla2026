import { NextResponse } from "next/server";
import db from "@/lib/db";
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

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (!all) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    if (search) {
      whereClause +=
        " AND (title LIKE ? OR description LIKE ? OR ai_tags LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const countResult = db
      .prepare(`SELECT COUNT(*) as total FROM items ${whereClause}`)
      .get(...params) as { total: number };

    const items = db
      .prepare(
        `SELECT * FROM items ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as Item[];

    return NextResponse.json({
      items,
      total: countResult.total,
      page,
      totalPages: Math.ceil(countResult.total / limit),
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

    const result = db
      .prepare(
        `INSERT INTO items (title, description, category, location_found, date_found, image_path, ai_tags, reporter_name, reporter_email, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title,
        description,
        category || "other",
        location_found,
        date_found,
        image_path || null,
        ai_tags ? JSON.stringify(ai_tags) : null,
        reporter_name || "",
        reporter_email || "",
        status
      );

    // Award 10 points for reporting a found item
    if (reporter_email) {
      db.prepare(
        `INSERT INTO rewards (email, name, points, reason, item_id) VALUES (?, ?, 10, 'Reported a found item', ?)`
      ).run(reporter_email, reporter_name || "Anonymous", result.lastInsertRowid);
    }

    const item = db
      .prepare("SELECT * FROM items WHERE id = ?")
      .get(result.lastInsertRowid) as Item;

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
