import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
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

    const supabase = await createServiceClient();

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Update claim status
    const { error: updateClaimError } = await supabase
      .from("claims")
      .update({ status })
      .eq("id", parseInt(id, 10));

    if (updateClaimError) {
      console.error("Error updating claim:", updateClaimError);
      return NextResponse.json(
        { error: "Failed to update claim" },
        { status: 500 }
      );
    }

    if (status === "approved") {
      // Update item status to claimed
      const { error: updateItemError } = await supabase
        .from("items")
        .update({ status: "claimed" })
        .eq("id", claim.item_id);

      if (updateItemError) {
        console.error("Error updating item:", updateItemError);
      }

      // Reject other pending claims for this item
      const { error: rejectError } = await supabase
        .from("claims")
        .update({ status: "rejected" })
        .eq("item_id", claim.item_id)
        .neq("id", parseInt(id, 10))
        .eq("status", "pending");

      if (rejectError) {
        console.error("Error rejecting other claims:", rejectError);
      }

      // Award bonus points to reporter for successful return
      const { data: item, error: itemError } = await supabase
        .from("items")
        .select("reporter_email, reporter_name")
        .eq("id", claim.item_id)
        .single();

      if (!itemError && item?.reporter_email) {
        const { error: rewardError } = await supabase
          .from("rewards")
          .insert({
            email: item.reporter_email,
            name: item.reporter_name || "Anonymous",
            points: 25,
            reason: "Item successfully returned to owner",
            item_id: claim.item_id,
          });

        if (rewardError) {
          console.error("Error awarding points:", rewardError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
