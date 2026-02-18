import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

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
    const body = await request.json();
    const { status } = body;

    if (!status || !["read", "replied"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'read' or 'replied'" },
        { status: 400 }
      );
    }

    const inquiry = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(status, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
