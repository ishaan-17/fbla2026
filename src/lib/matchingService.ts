/**
 * Matching Service - Core logic for matching lost items with found items
 * Uses weighted scoring: image similarity, category, tags, and text
 */

import { createBackgroundClient } from "@/lib/supabase/server";
import {
  generateImageEmbedding,
  cosineSimilarity,
  calculateTextSimilarity,
  calculateTagOverlap,
} from "@/lib/embeddingService";

// Matching weights - adjust these to tune matching quality
const WEIGHTS = {
  imageEmbedding: 0.4, // 40% weight for image similarity
  categoryMatch: 0.25, // 25% weight for category match
  tagOverlap: 0.2, // 20% weight for tag overlap
  textSimilarity: 0.15, // 15% weight for description similarity
};

// Minimum score threshold for a match to be considered
const MATCH_THRESHOLD = 0.3;

// Maximum matches to create per item
const MAX_MATCHES_PER_ITEM = 5;

interface FoundItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
  image_embedding?: number[] | null;
  ai_tags: string[] | null;
  status: string;
}

interface LostItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
  image_embedding?: number[] | null;
  ai_tags: string[] | null;
  reporter_email: string;
  status: string;
}

interface MatchScore {
  foundItemId: number;
  lostItemId: number;
  imageSimilarity: number;
  textSimilarity: number;
  categoryMatch: boolean;
  tagOverlap: number;
  totalScore: number;
}

/**
 * Parse embedding from Supabase (may be string or array)
 */
function parseEmbedding(embedding: unknown): number[] | null {
  if (!embedding) return null;
  
  // If it's already an array, return it
  if (Array.isArray(embedding)) {
    return embedding as number[];
  }
  
  // If it's a string (PostgreSQL vector format), parse it
  if (typeof embedding === "string") {
    try {
      // Remove brackets and split by comma
      const cleaned = embedding.replace(/^\[|\]$/g, "");
      return cleaned.split(",").map(Number);
    } catch {
      console.error("[matchingService] Failed to parse embedding string");
      return null;
    }
  }
  
  return null;
}

/**
 * Calculate match score between a lost item and a found item
 */
function calculateMatchScore(lost: LostItem, found: FoundItem): MatchScore {
  // Log item details
  console.log(`\n[matchingService] ═══════════════════════════════════════════`);
  console.log(`[matchingService] Comparing items:`);
  console.log(`[matchingService]   LOST:  "${lost.title}" - ${lost.description?.slice(0, 50)}${lost.description?.length > 50 ? '...' : ''}`);
  console.log(`[matchingService]   FOUND: "${found.title}" - ${found.description?.slice(0, 50)}${found.description?.length > 50 ? '...' : ''}`);
  
  // Parse embeddings (may come as strings from Supabase)
  const lostEmbedding = parseEmbedding(lost.image_embedding);
  const foundEmbedding = parseEmbedding(found.image_embedding);
  
  // Image similarity (if both have embeddings)
  let rawImageSimilarity = 0;
  let imageSimilarity = 0;
  if (lostEmbedding && foundEmbedding) {
    rawImageSimilarity = cosineSimilarity(lostEmbedding, foundEmbedding);
    
    // Only count image similarity if above 90% (CLIP baseline is ~75-85%)
    // Scale 0.90-1.00 → 0.00-1.00
    const IMAGE_SIMILARITY_THRESHOLD = 0.90;
    if (rawImageSimilarity >= IMAGE_SIMILARITY_THRESHOLD) {
      imageSimilarity = (rawImageSimilarity - IMAGE_SIMILARITY_THRESHOLD) / (1 - IMAGE_SIMILARITY_THRESHOLD);
    }
  }

  // Category match
  const categoryMatch =
    lost.category.toLowerCase() === found.category.toLowerCase();

  // Tag overlap
  const tagOverlap = calculateTagOverlap(lost.ai_tags, found.ai_tags);

  // Text similarity (title + description)
  const lostText = `${lost.title} ${lost.description}`;
  const foundText = `${found.title} ${found.description}`;
  const textSimilarity = calculateTextSimilarity(lostText, foundText);

  // Calculate weighted total score
  const totalScore =
    imageSimilarity * WEIGHTS.imageEmbedding +
    (categoryMatch ? 1 : 0) * WEIGHTS.categoryMatch +
    tagOverlap * WEIGHTS.tagOverlap +
    textSimilarity * WEIGHTS.textSimilarity;

  // Log scores
  console.log(`[matchingService]   Category: ${lost.category} vs ${found.category} → ${categoryMatch ? '✓ MATCH' : '✗ no match'}`);
  console.log(`[matchingService]   Image:    raw=${(rawImageSimilarity * 100).toFixed(1)}%, adjusted=${(imageSimilarity * 100).toFixed(1)}%`);
  console.log(`[matchingService]   Tags:     ${(tagOverlap * 100).toFixed(1)}% overlap`);
  console.log(`[matchingService]   Text:     ${(textSimilarity * 100).toFixed(1)}% similar`);
  console.log(`[matchingService]   ─────────────────────────────────────────────`);
  console.log(`[matchingService]   TOTAL SCORE: ${(totalScore * 100).toFixed(1)}% ${totalScore >= MATCH_THRESHOLD ? '→ ✓ MATCH!' : '→ below threshold'}`);

  return {
    foundItemId: found.id,
    lostItemId: lost.id,
    imageSimilarity: rawImageSimilarity, // Store raw for reference
    textSimilarity,
    categoryMatch,
    tagOverlap,
    totalScore,
  };
}

/**
 * Find matches for a newly submitted lost item
 * Called when someone submits an "I lost something" report
 */
export async function findMatchesForLostItem(
  lostItemId: number,
): Promise<MatchScore[]> {
  try {
    console.log(
      `[matchingService] Finding matches for lost item ${lostItemId}`,
    );

    const supabase = createBackgroundClient();

    // Fetch the lost item
    const { data: lostItem, error: lostError } = await supabase
      .from("lost_items")
      .select("*")
      .eq("id", lostItemId)
      .single();

    if (lostError || !lostItem) {
      console.error("[matchingService] Lost item not found:", lostError);
      return [];
    }

    // Fetch all approved found items
    const { data: foundItems, error: foundError } = await supabase
      .from("items")
      .select("*")
      .eq("status", "approved");

    if (foundError || !foundItems) {
      console.error(
        "[matchingService] Error fetching found items:",
        foundError,
      );
      return [];
    }

    console.log(
      `[matchingService] Comparing against ${foundItems.length} found items`,
    );

    // Calculate scores for all found items
    const scores: MatchScore[] = [];
    for (const found of foundItems) {
      const score = calculateMatchScore(
        lostItem as LostItem,
        found as FoundItem,
      );
      if (score.totalScore >= MATCH_THRESHOLD) {
        scores.push(score);
      }
    }

    // Sort by score descending and take top matches
    scores.sort((a, b) => b.totalScore - a.totalScore);
    const topMatches = scores.slice(0, MAX_MATCHES_PER_ITEM);

    // Save matches to database
    for (const match of topMatches) {
      const { error: insertError } = await supabase.from("item_matches").upsert(
        {
          lost_item_id: match.lostItemId,
          found_item_id: match.foundItemId,
          image_similarity: match.imageSimilarity,
          text_similarity: match.textSimilarity,
          category_match: match.categoryMatch,
          total_score: match.totalScore,
          status: "pending",
        },
        {
          onConflict: "lost_item_id,found_item_id",
        },
      );

      if (insertError) {
        console.error("[matchingService] Error saving match:", insertError);
      }
    }

    console.log(
      `[matchingService] Found ${topMatches.length} matches for lost item ${lostItemId}`,
    );
    return topMatches;
  } catch (error) {
    console.error("[matchingService] Error in findMatchesForLostItem:", error);
    return [];
  }
}

/**
 * Find matches for a newly approved found item
 * Called when an admin approves a found item report
 */
export async function findMatchesForFoundItem(
  foundItemId: number,
): Promise<MatchScore[]> {
  try {
    console.log(
      `[matchingService] Finding matches for found item ${foundItemId}`,
    );

    const supabase = createBackgroundClient();

    // Fetch the found item
    const { data: foundItem, error: foundError } = await supabase
      .from("items")
      .select("*")
      .eq("id", foundItemId)
      .single();

    if (foundError || !foundItem) {
      console.error("[matchingService] Found item not found:", foundError);
      return [];
    }

    // Fetch all active lost items
    const { data: lostItems, error: lostError } = await supabase
      .from("lost_items")
      .select("*")
      .eq("status", "searching");

    if (lostError || !lostItems) {
      console.error("[matchingService] Error fetching lost items:", lostError);
      return [];
    }

    console.log(
      `[matchingService] Comparing against ${lostItems.length} lost items`,
    );

    // Calculate scores for all lost items
    const scores: MatchScore[] = [];
    for (const lost of lostItems) {
      const score = calculateMatchScore(
        lost as LostItem,
        foundItem as FoundItem,
      );
      if (score.totalScore >= MATCH_THRESHOLD) {
        scores.push(score);
      }
    }

    // Sort by score descending and take top matches
    scores.sort((a, b) => b.totalScore - a.totalScore);
    const topMatches = scores.slice(0, MAX_MATCHES_PER_ITEM);

    // Save matches to database
    for (const match of topMatches) {
      const { error: insertError } = await supabase.from("item_matches").upsert(
        {
          lost_item_id: match.lostItemId,
          found_item_id: match.foundItemId,
          image_similarity: match.imageSimilarity,
          text_similarity: match.textSimilarity,
          category_match: match.categoryMatch,
          total_score: match.totalScore,
          status: "pending",
        },
        {
          onConflict: "lost_item_id,found_item_id",
        },
      );

      if (insertError) {
        console.error("[matchingService] Error saving match:", insertError);
      }
    }

    console.log(
      `[matchingService] Found ${topMatches.length} matches for found item ${foundItemId}`,
    );
    return topMatches;
  } catch (error) {
    console.error("[matchingService] Error in findMatchesForFoundItem:", error);
    return [];
  }
}

/**
 * Get all matches for a lost item
 */
export async function getMatchesForLostItem(lostItemId: number) {
  try {
    const supabase = createBackgroundClient();

    const { data: matches, error } = await supabase
      .from("item_matches")
      .select(
        `
        *,
        items:found_item_id (
          id,
          title,
          description,
          category,
          image_path,
          location_found,
          date_found
        )
      `,
      )
      .eq("lost_item_id", lostItemId)
      .order("total_score", { ascending: false });

    if (error) {
      console.error("[matchingService] Error fetching matches:", error);
      return [];
    }

    return matches;
  } catch (error) {
    console.error("[matchingService] Error in getMatchesForLostItem:", error);
    return [];
  }
}

/**
 * Update embedding for a lost item (call after image upload)
 */
export async function updateLostItemEmbedding(
  lostItemId: number,
  imageUrl: string,
): Promise<boolean> {
  try {
    console.log(
      `[matchingService] Generating embedding for lost item ${lostItemId}`,
    );

    const embedding = await generateImageEmbedding(imageUrl);
    if (!embedding) {
      console.error("[matchingService] Failed to generate embedding");
      return false;
    }

    const supabase = createBackgroundClient();

    // Format embedding as PostgreSQL vector literal and cast to any for Supabase
    const embeddingStr = `[${embedding.join(",")}]`;

    const { error } = await supabase
      .from("lost_items")
      .update({ image_embedding: embeddingStr as unknown as number[] })
      .eq("id", lostItemId);

    if (error) {
      console.error("[matchingService] Error updating embedding:", error);
      return false;
    }

    console.log(
      `[matchingService] Updated embedding for lost item ${lostItemId}`,
    );
    return true;
  } catch (error) {
    console.error("[matchingService] Error in updateLostItemEmbedding:", error);
    return false;
  }
}

/**
 * Update embedding for a found item (call after image upload/approval)
 */
export async function updateFoundItemEmbedding(
  foundItemId: number,
  imageUrl: string,
): Promise<boolean> {
  try {
    console.log(
      `[matchingService] Generating embedding for found item ${foundItemId}`,
    );

    const embedding = await generateImageEmbedding(imageUrl);
    if (!embedding) {
      console.error("[matchingService] Failed to generate embedding");
      return false;
    }

    const supabase = createBackgroundClient();

    // Format embedding as PostgreSQL vector literal and cast to any for Supabase
    const embeddingStr = `[${embedding.join(",")}]`;

    const { error } = await supabase
      .from("items")
      .update({ image_embedding: embeddingStr as unknown as number[] })
      .eq("id", foundItemId);

    if (error) {
      console.error("[matchingService] Error updating embedding:", error);
      return false;
    }

    console.log(
      `[matchingService] Updated embedding for found item ${foundItemId}`,
    );
    return true;
  } catch (error) {
    console.error(
      "[matchingService] Error in updateFoundItemEmbedding:",
      error,
    );
    return false;
  }
}
