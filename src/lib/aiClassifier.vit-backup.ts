"use client";

import { pipeline, type ImageClassificationPipeline, type ImageClassificationSingle } from "@huggingface/transformers";

// Singleton classifier instance (lazy loaded)
let classifierInstance: ImageClassificationPipeline | null = null;
let loadingPromise: Promise<ImageClassificationPipeline> | null = null;

// Model configuration
const MODEL_ID = "Xenova/vit-base-patch16-224";
const CONFIDENCE_THRESHOLD = 0.02; // Low threshold - we'll use presence, not confidence
const MAX_TAGS = 5;

// ============================================================================
// APP TAGS - These are the ONLY tags the AI can suggest
// Must match COMMON_TAGS in report/page.tsx
// ============================================================================
export const APP_TAGS = {
  // Colors
  colors: ["Black", "White", "Blue", "Red", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Gray"],
  // Sizes
  sizes: ["Small", "Medium", "Large"],
  // Materials
  materials: ["Metal", "Plastic", "Fabric", "Leather", "Glass", "Wood"],
  // Types
  types: ["Electronics", "Valuable", "Keys", "Jewelry", "Branded"],
} as const;

// ============================================================================
// MAPPING: ImageNet labels → App Tags
// ============================================================================

// Objects that suggest "Electronics" tag
const ELECTRONICS_LABELS = [
  "cellular telephone", "cell", "phone", "mobile", "smartphone", "iPod", 
  "laptop", "notebook", "computer", "keyboard", "mouse", "remote control",
  "television", "monitor", "screen", "digital watch", "calculator", "printer",
  "speaker", "microphone", "headphone", "earphone", "camera", "projector",
  "hard disc", "USB", "joystick", "radio", "modem", "power", "charger", "cable",
  "tablet", "iPad", "electronic", "device", "gadget", "tech"
];

// Objects that suggest "Valuable" tag
const VALUABLE_LABELS = [
  "wallet", "billfold", "purse", "watch", "jewelry", "necklace", "ring",
  "bracelet", "earring", "gold", "silver", "diamond", "gem", "precious",
  "money", "cash", "credit card", "passport", "document"
];

// Objects that suggest "Keys" tag  
const KEYS_LABELS = [
  "key", "keychain", "lock", "padlock", "combination lock", "car key", "fob",
  "remote control", "remote", "opener", "starter"
];

// Objects that suggest "Jewelry" tag
const JEWELRY_LABELS = [
  "necklace", "ring", "bracelet", "earring", "watch", "chain", "pendant",
  "brooch", "jewel", "gem", "gold", "silver", "diamond", "pearl"
];

// Objects that suggest "Branded" tag (expensive/designer items)
const BRANDED_LABELS = [
  "designer", "luxury", "brand", "logo", "nike", "adidas", "apple", "samsung",
  "gucci", "louis vuitton", "prada", "sunglasses", "handbag", "briefcase"
];

// Material associations
const METAL_LABELS = ["metal", "steel", "iron", "aluminum", "chrome", "silver", "gold", "brass", "copper", "key", "lock", "chain", "watch", "ring", "can"];
const PLASTIC_LABELS = ["plastic", "bottle", "container", "pen", "remote", "case", "toy", "bucket"];
const FABRIC_LABELS = ["fabric", "cloth", "cotton", "wool", "silk", "linen", "backpack", "bag", "jacket", "shirt", "dress", "sweater", "hat", "scarf", "sock", "glove"];
const LEATHER_LABELS = ["leather", "wallet", "purse", "belt", "shoe", "boot", "handbag", "briefcase", "jacket"];
const GLASS_LABELS = ["glass", "glasses", "sunglasses", "spectacles", "bottle", "jar", "mirror", "lens", "window"];
const WOOD_LABELS = ["wood", "wooden", "timber", "plywood", "bamboo", "pencil", "ruler", "frame"];

// Color associations (based on common object colors)
const COLOR_ASSOCIATIONS: Record<string, string[]> = {
  "Black": ["black", "dark", "ebony", "charcoal", "laptop", "phone", "keyboard", "mouse", "headphone", "camera", "umbrella", "suit", "tire"],
  "White": ["white", "ivory", "cream", "pearl", "snow", "paper", "shirt", "sneaker", "cloud"],
  "Blue": ["blue", "navy", "azure", "cobalt", "denim", "jean", "sky"],
  "Red": ["red", "crimson", "scarlet", "ruby", "cherry", "fire", "apple"],
  "Green": ["green", "emerald", "olive", "lime", "grass", "leaf", "plant"],
  "Yellow": ["yellow", "gold", "golden", "lemon", "sun", "banana"],
  "Orange": ["orange", "tangerine", "peach", "carrot", "pumpkin"],
  "Purple": ["purple", "violet", "lavender", "plum", "grape"],
  "Pink": ["pink", "rose", "magenta", "flamingo"],
  "Brown": ["brown", "tan", "chocolate", "coffee", "leather", "wood", "wooden", "wallet", "briefcase"],
  "Gray": ["gray", "grey", "silver", "metal", "steel", "concrete", "stone"],
};

// Size associations (rough heuristics)
const SMALL_LABELS = ["key", "ring", "earring", "coin", "pen", "pencil", "USB", "AirPod", "earbud", "pill", "button", "pin", "clip", "watch", "lighter"];
const MEDIUM_LABELS = ["phone", "wallet", "glasses", "book", "bottle", "mouse", "remote", "calculator", "camera"];
const LARGE_LABELS = ["backpack", "laptop", "suitcase", "jacket", "coat", "umbrella", "guitar", "skateboard", "helmet", "bag"];

// ============================================================================
// CATEGORY DETECTION - Maps to SCHOOL_CATEGORIES from categories.ts
// ============================================================================
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  "water_bottle": ["bottle", "water", "flask", "thermos", "canteen", "tumbler", "cup", "mug"],
  "pencil_case": ["pencil case", "pencil box", "pen case", "pouch", "stationery"],
  "backpack": ["backpack", "knapsack", "rucksack", "school bag", "book bag", "bag", "satchel"],
  "clothing": ["jacket", "coat", "sweater", "hoodie", "shirt", "pants", "jeans", "dress", "skirt", "hat", "cap", "scarf", "glove", "sock", "shoe", "sneaker", "boot", "sandal", "jersey", "sweatshirt", "cardigan", "vest", "tie", "belt"],
  "electronics": ["phone", "cell", "mobile", "laptop", "computer", "tablet", "iPad", "camera", "speaker", "headphone", "earphone", "charger", "cable", "mouse", "keyboard", "monitor", "screen", "calculator", "remote", "USB", "flash drive", "hard drive", "electronic", "device", "iPod", "MP3", "smartwatch", "watch"],
  "keys": ["key", "keychain", "lock", "padlock", "car key", "house key"],
  "book": ["book", "textbook", "notebook", "binder", "folder", "paper", "document", "magazine", "novel", "planner", "diary", "journal"],
  "lunchbox": ["lunchbox", "lunch box", "lunch bag", "food container", "tupperware", "bento"],
  "umbrella": ["umbrella", "parasol"],
  "sports_equipment": ["ball", "basketball", "soccer", "football", "baseball", "tennis", "golf", "volleyball", "racket", "bat", "glove", "helmet", "skateboard", "scooter", "bicycle", "bike", "skate", "ski", "snowboard", "dumbbell", "yoga mat", "frisbee"],
  "jewelry": ["jewelry", "necklace", "bracelet", "ring", "earring", "chain", "pendant", "brooch", "gem", "diamond", "gold", "silver", "pearl"],
  "glasses": ["glasses", "eyeglasses", "sunglasses", "spectacles", "goggles", "lens"],
  "headphones": ["headphone", "earphone", "earbud", "AirPod", "headset", "earpiece"],
};

export interface ClassificationResult {
  tag: string;
  category: "color" | "size" | "material" | "type";
  confidence: number;
  originalLabel: string;
}

export type LoadingStatus = "idle" | "loading" | "ready" | "error";

/**
 * Check if any of the keywords appear in the label
 */
function matchesAny(label: string, keywords: string[]): boolean {
  const lowerLabel = label.toLowerCase();
  return keywords.some(kw => lowerLabel.includes(kw.toLowerCase()));
}

/**
 * Get the best color match for a label
 */
function detectColor(label: string): string | null {
  for (const [color, keywords] of Object.entries(COLOR_ASSOCIATIONS)) {
    if (matchesAny(label, keywords)) {
      return color;
    }
  }
  return null;
}

/**
 * Detect the best category for the image based on detected labels
 */
function detectCategory(labels: string[]): string | null {
  const categoryScores: Record<string, number> = {};
  
  for (const label of labels) {
    for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
      if (matchesAny(label, keywords)) {
        categoryScores[category] = (categoryScores[category] || 0) + 1;
      }
    }
  }
  
  // Return category with highest score
  let bestCategory: string | null = null;
  let bestScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

/**
 * Get the current loading status of the classifier
 */
export function getClassifierStatus(): LoadingStatus {
  if (classifierInstance) return "ready";
  if (loadingPromise) return "loading";
  return "idle";
}

/**
 * Load the image classification model (lazy, singleton)
 */
export async function loadClassifier(
  onProgress?: (progress: number) => void
): Promise<ImageClassificationPipeline> {
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
      
      const classifier = await pipeline("image-classification", MODEL_ID, {
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

export interface ClassificationOutput {
  tags: ClassificationResult[];
  suggestedCategory: string | null;
}

/**
 * Classify an image and return tags from the app's predefined tag list
 */
export async function classifyImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<ClassificationOutput> {
  console.log("[aiClassifier] Starting classification...");
  
  const classifier = await loadClassifier(onProgress);
  console.log("[aiClassifier] Model loaded, running inference...");

  const rawResults = await classifier(imageSource, { top_k: 10 });
  console.log("[aiClassifier] Raw model output:", rawResults);
  
  const results: ImageClassificationSingle[] = Array.isArray(rawResults) 
    ? rawResults as ImageClassificationSingle[]
    : [rawResults as ImageClassificationSingle];

  // Collect all detected labels for analysis
  const allLabels = results
    .filter(r => r.score >= CONFIDENCE_THRESHOLD)
    .map(r => r.label);
  
  console.log("[aiClassifier] Detected labels:", allLabels);

  // Detect the best category
  const suggestedCategory = detectCategory(allLabels);
  console.log("[aiClassifier] Suggested category:", suggestedCategory);

  const mappedResults: ClassificationResult[] = [];
  const usedTags = new Set<string>();

  // Helper to add a tag if not already added
  const addTag = (tag: string, category: ClassificationResult["category"], confidence: number, originalLabel: string) => {
    if (!usedTags.has(tag) && mappedResults.length < MAX_TAGS) {
      usedTags.add(tag);
      mappedResults.push({ tag, category, confidence, originalLabel });
    }
  };

  // Process each result
  for (const result of results) {
    if (result.score < CONFIDENCE_THRESHOLD) continue;
    const label = result.label;

    // Check TYPE tags
    if (matchesAny(label, ELECTRONICS_LABELS)) {
      addTag("Electronics", "type", result.score, label);
    }
    if (matchesAny(label, VALUABLE_LABELS)) {
      addTag("Valuable", "type", result.score, label);
    }
    if (matchesAny(label, KEYS_LABELS)) {
      addTag("Keys", "type", result.score, label);
    }
    if (matchesAny(label, JEWELRY_LABELS)) {
      addTag("Jewelry", "type", result.score, label);
    }
    if (matchesAny(label, BRANDED_LABELS)) {
      addTag("Branded", "type", result.score, label);
    }

    // Check MATERIAL tags
    if (matchesAny(label, METAL_LABELS)) {
      addTag("Metal", "material", result.score, label);
    }
    if (matchesAny(label, PLASTIC_LABELS)) {
      addTag("Plastic", "material", result.score, label);
    }
    if (matchesAny(label, FABRIC_LABELS)) {
      addTag("Fabric", "material", result.score, label);
    }
    if (matchesAny(label, LEATHER_LABELS)) {
      addTag("Leather", "material", result.score, label);
    }
    if (matchesAny(label, GLASS_LABELS)) {
      addTag("Glass", "material", result.score, label);
    }
    if (matchesAny(label, WOOD_LABELS)) {
      addTag("Wood", "material", result.score, label);
    }

    // Check SIZE tags
    if (matchesAny(label, SMALL_LABELS)) {
      addTag("Small", "size", result.score, label);
    }
    if (matchesAny(label, MEDIUM_LABELS)) {
      addTag("Medium", "size", result.score, label);
    }
    if (matchesAny(label, LARGE_LABELS)) {
      addTag("Large", "size", result.score, label);
    }

    // Check COLOR tags
    const color = detectColor(label);
    if (color) {
      addTag(color, "color", result.score, label);
    }
  }

  console.log("[aiClassifier] Final tags:", mappedResults);
  return { tags: mappedResults, suggestedCategory };
}

/**
 * Preload the classifier model
 */
export function preloadClassifier(): void {
  loadClassifier().catch(() => {});
}
