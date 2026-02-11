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

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(id) as
      | { id: number; item_id: number; status: string }
      | undefined;

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Use transaction: update claim, item status, and award points
    const updateClaimAndItem = db.transaction(() => {
      db.prepare("UPDATE claims SET status = ? WHERE id = ?").run(
        status,
        id
      );

      if (status === "approved") {
        db.prepare("UPDATE items SET status = 'claimed' WHERE id = ?").run(
          claim.item_id
        );
        // Reject other pending claims for this item
        db.prepare(
          "UPDATE claims SET status = 'rejected' WHERE item_id = ? AND id != ? AND status = 'pending'"
        ).run(claim.item_id, id);

        // Award bonus points to reporter for successful return
        const item = db.prepare("SELECT * FROM items WHERE id = ?").get(claim.item_id) as
          | { reporter_email: string; reporter_name: string } | undefined;
        if (item?.reporter_email) {
          db.prepare(
            `INSERT INTO rewards (email, name, points, reason, item_id) VALUES (?, ?, 25, 'Item successfully returned to owner', ?)`
          ).run(item.reporter_email, item.reporter_name || "Anonymous", claim.item_id);
        }
      }
    });

    updateClaimAndItem();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
