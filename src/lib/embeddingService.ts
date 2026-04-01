/**
 * Embedding Service - Server-side CLIP embeddings for image matching
 * Uses @huggingface/transformers to generate 512-dimensional embeddings
 */

import { 
  AutoProcessor, 
  CLIPVisionModelWithProjection,
  RawImage,
  type Processor
} from "@huggingface/transformers";

// Singleton instances
let processor: Processor | null = null;
let visionModel: CLIPVisionModelWithProjection | null = null;
let loadingPromise: Promise<void> | null = null;

const MODEL_ID = "Xenova/clip-vit-base-patch32";

/**
 * Load the CLIP model and processor (lazy loaded)
 */
async function loadModel(): Promise<void> {
  if (processor && visionModel) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      console.log("[embeddingService] Loading CLIP model for embeddings...");
      
      // Load processor and vision model in parallel
      const [loadedProcessor, loadedModel] = await Promise.all([
        AutoProcessor.from_pretrained(MODEL_ID),
        CLIPVisionModelWithProjection.from_pretrained(MODEL_ID),
      ]);
      
      processor = loadedProcessor;
      visionModel = loadedModel;
      
      console.log("[embeddingService] CLIP model loaded successfully");
    } catch (error) {
      loadingPromise = null;
      console.error("[embeddingService] Failed to load CLIP model:", error);
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Generate embedding for an image
 * @param imageSource - URL (http/https) to fetch image from
 * @returns 512-dimensional embedding vector
 */
export async function generateImageEmbedding(
  imageSource: string
): Promise<number[] | null> {
  try {
    console.log("[embeddingService] Generating embedding for image...");
    
    await loadModel();
    
    if (!processor || !visionModel) {
      console.error("[embeddingService] Model not loaded");
      return null;
    }
    
    // Load the image from URL
    const image = await RawImage.fromURL(imageSource);
    
    // Process the image to get pixel values
    const imageInputs = await processor(image);
    
    // Run through vision model to get embeddings
    const { image_embeds } = await visionModel(imageInputs);
    
    // Convert to array and normalize
    const embedding = Array.from(image_embeds.data as Float32Array);
    
    // Normalize the embedding vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalizedEmbedding = embedding.map(val => val / norm);
    
    console.log(`[embeddingService] Generated embedding with ${normalizedEmbedding.length} dimensions`);
    return normalizedEmbedding;
  } catch (error) {
    console.error("[embeddingService] Error generating embedding:", error);
    return null;
  }
}

/**
 * Generate embedding for an image from a Buffer
 * @param imageBuffer - PNG or JPEG image buffer
 * @returns 512-dimensional embedding vector
 */
export async function generateImageEmbeddingFromBuffer(
  imageBuffer: Buffer
): Promise<number[] | null> {
  try {
    console.log("[embeddingService] Generating embedding from buffer...");
    
    await loadModel();
    
    if (!processor || !visionModel) {
      console.error("[embeddingService] Model not loaded");
      return null;
    }
    
    // Create a Blob from the buffer and use RawImage.fromBlob
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: "image/png" });
    const image = await RawImage.fromBlob(blob);
    
    // Process the image to get pixel values
    const imageInputs = await processor(image);
    
    // Run through vision model to get embeddings
    const { image_embeds } = await visionModel(imageInputs);
    
    // Convert to array and normalize
    const embedding = Array.from(image_embeds.data as Float32Array);
    
    // Normalize the embedding vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalizedEmbedding = embedding.map(val => val / norm);
    
    console.log(`[embeddingService] Generated embedding with ${normalizedEmbedding.length} dimensions`);
    return normalizedEmbedding;
  } catch (error) {
    console.error("[embeddingService] Error generating embedding from buffer:", error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    console.error("[embeddingService] Embedding dimensions mismatch");
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  // Normalize to 0-1 range (cosine similarity is -1 to 1)
  return (dotProduct / denominator + 1) / 2;
}

/**
 * Calculate text similarity using simple word overlap
 * More sophisticated methods could use sentence transformers
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Calculate tag overlap between two tag arrays
 */
export function calculateTagOverlap(tags1: string[] | null, tags2: string[] | null): number {
  if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) return 0;

  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Preload the embedding model (call on server startup if needed)
 */
export function preloadEmbeddingModel(): void {
  loadModel().catch(() => {});
}
