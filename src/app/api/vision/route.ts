// app/api/vision/route.js
import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const client = new ImageAnnotatorClient();

export async function POST(request: Request) {
  try {
    const { imageBuffer } = await request.json(); // Expecting the base64 image string

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "Image buffer is required" },
        { status: 400 },
      );
    }

    // Prepare the image request.
    // The Vision API client can accept a base64 encoded string directly.
    const image = {
      content: imageBuffer,
    };

    const requestBody = {
      image: image,
      features: [{ type: "SAFE_SEARCH_DETECTION" }], // Explicitly request SafeSearch
    };

    const [result] = await client.annotateImage(requestBody);
    const safeSearchResult = result.safeSearchAnnotation;

    return NextResponse.json({
      safeSearch: safeSearchResult,
    });
  } catch (error) {
    console.error("Error calling Vision API:", error);
    // Be careful not to expose sensitive error details to the client in production
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}
