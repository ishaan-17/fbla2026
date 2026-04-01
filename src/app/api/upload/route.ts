import { NextResponse } from "next/server";
import crypto from "crypto";
import { processItemImage } from "@/lib/imageProcessor";
import { createServiceClient } from "@/lib/supabase/server";
import { generateImageEmbeddingFromBuffer } from "@/lib/embeddingService";

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

    // Process: remove background → get both styled and clean versions
    let finalBuffer: Buffer;
    let cleanBuffer: Buffer;
    try {
      const result = await processItemImage(rawBuffer);
      finalBuffer = result.finalBuffer;
      cleanBuffer = result.cleanBuffer;
    } catch (err) {
      console.warn("[upload] image processing failed, saving original:", err);
      finalBuffer = rawBuffer;
      cleanBuffer = rawBuffer;
    }

    // Generate embedding from clean image buffer (no styled background)
    let embedding: number[] | null = null;
    try {
      embedding = await generateImageEmbeddingFromBuffer(cleanBuffer);
      if (embedding) {
        console.log(`[upload] Generated embedding with ${embedding.length} dimensions`);
      }
    } catch (err) {
      console.warn("[upload] embedding generation failed:", err);
    }

    // Upload styled image to Supabase Storage
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
      embedding: embedding, // Return embedding for the form to include in submission
    });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
