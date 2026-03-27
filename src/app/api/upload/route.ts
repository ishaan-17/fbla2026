import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { processItemImage } from "@/lib/imageProcessor";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Always auto-rotate based on EXIF orientation (fixes iPhone sideways photos)
    const rotatedBuffer = await sharp(rawBuffer).rotate().toBuffer();

    // Process: remove background → center → place on gray gradient
    let finalBuffer: Buffer;
    try {
      finalBuffer = await processItemImage(rotatedBuffer);
    } catch (err) {
      console.warn("[upload] image processing failed, saving rotated original:", err);
      finalBuffer = rotatedBuffer;
    }

    // Upload to Supabase Storage
    const supabase = await createServiceClient();
    const filename = `${Date.now()}-${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("item-images")
      .upload(filename, finalBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] Supabase storage error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload to storage" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("item-images")
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      path: publicUrl,
    });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
