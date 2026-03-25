"use client";

import { pipeline, type ZeroShotImageClassificationPipeline } from "@huggingface/transformers";

// Singleton classifier instance (lazy loaded)
let classifierInstance: ZeroShotImageClassificationPipeline | null = null;
let loadingPromise: Promise<ZeroShotImageClassificationPipeline> | null = null;

// Model configuration
const MODEL_ID = "Xenova/clip-vit-base-patch32";
const CONFIDENCE_THRESHOLD = 0.02; // Lower threshold since CLIP spreads probability
const MAX_TAGS = 5;

// ============================================================================
// CATEGORIES - Must match SCHOOL_CATEGORIES from categories.ts
// ============================================================================
const CATEGORY_LABELS = [
  "a water bottle",
  "a pencil case or pencil pouch",
  "a backpack or school bag",
  "clothing like a jacket, hoodie, hat, or scarf",
  "electronics like a phone, laptop, tablet, or charger",
  "keys or a keychain",
  "a book, notebook, or binder",
  "a lunchbox or food container",
  "an umbrella",
  "sports equipment like a ball, racket, or helmet",
  "jewelry like a ring, necklace, bracelet, or earrings",
  "glasses or sunglasses",
  "headphones or earbuds",
];

// Map CLIP labels back to category names
const LABEL_TO_CATEGORY: Record<string, string> = {
  "a water bottle": "water_bottle",
  "a pencil case or pencil pouch": "pencil_case",
  "a backpack or school bag": "backpack",
  "clothing like a jacket, hoodie, hat, or scarf": "clothing",
  "electronics like a phone, laptop, tablet, or charger": "electronics",
  "keys or a keychain": "keys",
  "a book, notebook, or binder": "book",
  "a lunchbox or food container": "lunchbox",
  "an umbrella": "umbrella",
  "sports equipment like a ball, racket, or helmet": "sports_equipment",
  "jewelry like a ring, necklace, bracelet, or earrings": "jewelry",
  "glasses or sunglasses": "glasses",
  "headphones or earbuds": "headphones",
};

// ============================================================================
// TAG LABELS - Must match COMMON_TAGS from report/page.tsx
// ============================================================================
const TAG_LABELS = {
  colors: [
    "a black colored object",
    "a white colored object",
    "a blue colored object",
    "a red colored object",
    "a green colored object",
    "a yellow colored object",
    "an orange colored object",
    "a purple colored object",
    "a pink colored object",
    "a brown colored object",
    "a gray or silver colored object",
  ],
  sizes: [
    "a small object that fits in your hand",
    "a medium sized object",
    "a large object like a bag or backpack",
  ],
  materials: [
    "an object made of metal",
    "an object made of plastic",
    "an object made of fabric or cloth",
    "an object made of leather",
    "an object made of glass",
    "an object made of wood",
  ],
  types: [
    "an electronic device",
    "a valuable or expensive item",
    "keys or a lock",
    "jewelry or accessories",
    "a branded or designer item with a logo",
  ],
};

// Map CLIP tag labels back to app tag names
const TAG_LABEL_MAP: Record<string, { tag: string; category: "color" | "size" | "material" | "type" }> = {
  "a black colored object": { tag: "Black", category: "color" },
  "a white colored object": { tag: "White", category: "color" },
  "a blue colored object": { tag: "Blue", category: "color" },
  "a red colored object": { tag: "Red", category: "color" },
  "a green colored object": { tag: "Green", category: "color" },
  "a yellow colored object": { tag: "Yellow", category: "color" },
  "an orange colored object": { tag: "Orange", category: "color" },
  "a purple colored object": { tag: "Purple", category: "color" },
  "a pink colored object": { tag: "Pink", category: "color" },
  "a brown colored object": { tag: "Brown", category: "color" },
  "a gray or silver colored object": { tag: "Gray", category: "color" },
  "a small object that fits in your hand": { tag: "Small", category: "size" },
  "a medium sized object": { tag: "Medium", category: "size" },
  "a large object like a bag or backpack": { tag: "Large", category: "size" },
  "an object made of metal": { tag: "Metal", category: "material" },
  "an object made of plastic": { tag: "Plastic", category: "material" },
  "an object made of fabric or cloth": { tag: "Fabric", category: "material" },
  "an object made of leather": { tag: "Leather", category: "material" },
  "an object made of glass": { tag: "Glass", category: "material" },
  "an object made of wood": { tag: "Wood", category: "material" },
  "an electronic device": { tag: "Electronics", category: "type" },
  "a valuable or expensive item": { tag: "Valuable", category: "type" },
  "keys or a lock": { tag: "Keys", category: "type" },
  "jewelry or accessories": { tag: "Jewelry", category: "type" },
  "a branded or designer item with a logo": { tag: "Branded", category: "type" },
};

export interface ClassificationResult {
  tag: string;
  category: "color" | "size" | "material" | "type";
  confidence: number;
  originalLabel: string;
}

export interface ClassificationOutput {
  tags: ClassificationResult[];
  suggestedCategory: string | null;
}

export type LoadingStatus = "idle" | "loading" | "ready" | "error";

export function getClassifierStatus(): LoadingStatus {
  if (classifierInstance) return "ready";
  if (loadingPromise) return "loading";
  return "idle";
}

export async function loadClassifier(
  onProgress?: (progress: number) => void
): Promise<ZeroShotImageClassificationPipeline> {
  if (classifierInstance) {
    onProgress?.(100);
    return classifierInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      onProgress?.(10);
      
      const classifier = await pipeline("zero-shot-image-classification", MODEL_ID, {
        progress_callback: (progress) => {
          if (typeof progress === "object" && "progress" in progress && progress.progress !== undefined) {
            onProgress?.(10 + (progress.progress * 0.85));
          }
        },
      });

      onProgress?.(100);
      classifierInstance = classifier;
      return classifier;
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export async function classifyImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<ClassificationOutput> {
  console.log("[aiClassifier/CLIP] Starting classification...");
  
  const classifier = await loadClassifier(onProgress);
  console.log("[aiClassifier/CLIP] Model loaded, running inference...");

  // First, detect the category
  console.log("[aiClassifier/CLIP] Detecting category...");
  const categoryResults = await classifier(imageSource, CATEGORY_LABELS);
  console.log("[aiClassifier/CLIP] Category results:", categoryResults);
  
  // Get the best category (results are always an array for zero-shot classification)
  const categoryArray = categoryResults as { label: string; score: number }[];
  const topCategory = categoryArray[0];
  const suggestedCategory = topCategory ? LABEL_TO_CATEGORY[topCategory.label] || null : null;
  console.log("[aiClassifier/CLIP] Suggested category:", suggestedCategory);

  // Detect tags by category to avoid probability dilution
  // Each category is classified independently for better accuracy
  const tags: ClassificationResult[] = [];

  // Detect color
  console.log("[aiClassifier/CLIP] Detecting color...");
  const colorResults = await classifier(imageSource, TAG_LABELS.colors) as { label: string; score: number }[];
  console.log("[aiClassifier/CLIP] Color results:", colorResults);
  if (colorResults[0] && colorResults[0].score >= CONFIDENCE_THRESHOLD) {
    const mapping = TAG_LABEL_MAP[colorResults[0].label];
    if (mapping) {
      tags.push({ tag: mapping.tag, category: "color", confidence: colorResults[0].score, originalLabel: colorResults[0].label });
    }
  }

  // Detect size
  console.log("[aiClassifier/CLIP] Detecting size...");
  const sizeResults = await classifier(imageSource, TAG_LABELS.sizes) as { label: string; score: number }[];
  console.log("[aiClassifier/CLIP] Size results:", sizeResults);
  if (sizeResults[0] && sizeResults[0].score >= CONFIDENCE_THRESHOLD) {
    const mapping = TAG_LABEL_MAP[sizeResults[0].label];
    if (mapping) {
      tags.push({ tag: mapping.tag, category: "size", confidence: sizeResults[0].score, originalLabel: sizeResults[0].label });
    }
  }

  // Detect material
  console.log("[aiClassifier/CLIP] Detecting material...");
  const materialResults = await classifier(imageSource, TAG_LABELS.materials) as { label: string; score: number }[];
  console.log("[aiClassifier/CLIP] Material results:", materialResults);
  if (materialResults[0] && materialResults[0].score >= CONFIDENCE_THRESHOLD) {
    const mapping = TAG_LABEL_MAP[materialResults[0].label];
    if (mapping) {
      tags.push({ tag: mapping.tag, category: "material", confidence: materialResults[0].score, originalLabel: materialResults[0].label });
    }
  }

  // Detect type
  console.log("[aiClassifier/CLIP] Detecting type...");
  const typeResults = await classifier(imageSource, TAG_LABELS.types) as { label: string; score: number }[];
  console.log("[aiClassifier/CLIP] Type results:", typeResults);
  if (typeResults[0] && typeResults[0].score >= CONFIDENCE_THRESHOLD) {
    const mapping = TAG_LABEL_MAP[typeResults[0].label];
    if (mapping) {
      tags.push({ tag: mapping.tag, category: "type", confidence: typeResults[0].score, originalLabel: typeResults[0].label });
    }
  }

  console.log("[aiClassifier/CLIP] Final tags:", tags);
  return { tags, suggestedCategory };
}

export function preloadClassifier(): void {
  loadClassifier().catch(() => {});
}
