import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { processItemImage } from "@/lib/imageProcessor";

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Process: remove background → center → place on gray gradient
    let finalBuffer: Buffer;
    try {
      finalBuffer = await processItemImage(rawBuffer);
    } catch (err) {
      console.warn("[upload] image processing failed, saving original:", err);
      finalBuffer = rawBuffer;
    }

    // Always save as .png since the processor outputs PNG
    const filename = `${Date.now()}-${crypto.randomUUID()}.png`;
    await writeFile(path.join(uploadsDir, filename), finalBuffer);

    return NextResponse.json({
      success: true,
      path: `uploads/${filename}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
