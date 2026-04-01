import { NextResponse } from "next/server";
import { createBackgroundClient } from "@/lib/supabase/server";
import { generateImageEmbeddingFromBuffer } from "@/lib/embeddingService";
import { processItemImage } from "@/lib/imageProcessor";

/**
 * POST /api/generate-embeddings - Regenerate embeddings for all items
 * Downloads images, re-processes them to get clean versions, and generates embeddings
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRegenerate = searchParams.get("force") === "true";
    
    const supabase = createBackgroundClient();
    
    // Get all found items (optionally only those without embeddings)
    let foundQuery = supabase
      .from("items")
      .select("id, image_path")
      .not("image_path", "is", null);
    
    if (!forceRegenerate) {
      foundQuery = foundQuery.is("image_embedding", null);
    }
    
    const { data: foundItems, error: foundError } = await foundQuery;
    
    if (foundError) {
      return NextResponse.json({ error: foundError.message }, { status: 500 });
    }
    
    // Get all lost items
    let lostQuery = supabase
      .from("lost_items")
      .select("id, image_path")
      .not("image_path", "is", null);
    
    if (!forceRegenerate) {
      lostQuery = lostQuery.is("image_embedding", null);
    }
    
    const { data: lostItems, error: lostError } = await lostQuery;
    
    if (lostError) {
      return NextResponse.json({ error: lostError.message }, { status: 500 });
    }
    
    const results: { type: string; id: number; success: boolean; error?: string }[] = [];
    
    // Process found items
    console.log(`[generate-embeddings] Processing ${foundItems?.length || 0} found items...`);
    for (const item of foundItems || []) {
      if (!item.image_path) continue;
      
      console.log(`[generate-embeddings] Processing found item ${item.id}...`);
      try {
        const embedding = await generateEmbeddingFromUrl(item.image_path);
        if (embedding) {
          const embeddingStr = `[${embedding.join(",")}]`;
          const { error } = await supabase
            .from("items")
            .update({ image_embedding: embeddingStr as unknown as number[] })
            .eq("id", item.id);
          
          if (error) throw error;
          results.push({ type: "found", id: item.id, success: true });
        } else {
          results.push({ type: "found", id: item.id, success: false, error: "Failed to generate embedding" });
        }
      } catch (err) {
        results.push({ type: "found", id: item.id, success: false, error: String(err) });
      }
    }
    
    // Process lost items
    console.log(`[generate-embeddings] Processing ${lostItems?.length || 0} lost items...`);
    for (const item of lostItems || []) {
      if (!item.image_path) continue;
      
      console.log(`[generate-embeddings] Processing lost item ${item.id}...`);
      try {
        const embedding = await generateEmbeddingFromUrl(item.image_path);
        if (embedding) {
          const embeddingStr = `[${embedding.join(",")}]`;
          const { error } = await supabase
            .from("lost_items")
            .update({ image_embedding: embeddingStr as unknown as number[] })
            .eq("id", item.id);
          
          if (error) throw error;
          results.push({ type: "lost", id: item.id, success: true });
        } else {
          results.push({ type: "lost", id: item.id, success: false, error: "Failed to generate embedding" });
        }
      } catch (err) {
        results.push({ type: "lost", id: item.id, success: false, error: String(err) });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`[generate-embeddings] Completed: ${successCount}/${results.length} successful`);
    
    return NextResponse.json({
      message: `Generated embeddings for ${successCount}/${results.length} items`,
      results,
    });
  } catch (error) {
    console.error("[generate-embeddings] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * Download image, re-process to get clean version, and generate embedding
 */
async function generateEmbeddingFromUrl(imageUrl: string): Promise<number[] | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    // Re-process to get clean version (object on white background)
    const { cleanBuffer } = await processItemImage(imageBuffer);
    
    // Generate embedding from clean buffer
    return await generateImageEmbeddingFromBuffer(cleanBuffer);
  } catch (error) {
    console.error("[generate-embeddings] Error processing image:", error);
    return null;
  }
}

