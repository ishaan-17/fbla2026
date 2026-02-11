import type { AIPrediction, MappedTag } from "@/types";
import { SCHOOL_CATEGORIES } from "./categories";

const LABEL_TO_CATEGORY: Record<string, string> = {
  // Water Bottle
  "water bottle": "water_bottle",
  "pop bottle": "water_bottle",
  "bottle": "water_bottle",
  "water jug": "water_bottle",

  // Pencil Case
  "pencil case": "pencil_case",
  "pencil box": "pencil_case",
  "pencil sharpener": "pencil_case",
  "ballpoint": "pencil_case",
  "fountain pen": "pencil_case",
  "rubber eraser": "pencil_case",
  "eraser": "pencil_case",
  "ruler": "pencil_case",

  // Backpack
  "backpack": "backpack",
  "knapsack": "backpack",
  "rucksack": "backpack",
  "back pack": "backpack",
  "bookbag": "backpack",
  "messenger bag": "backpack",
  "mailbag": "backpack",

  // Clothing
  "jersey": "clothing",
  "sweatshirt": "clothing",
  "jean": "clothing",
  "sock": "clothing",
  "coat": "clothing",
  "jacket": "clothing",
  "hoodie": "clothing",
  "shirt": "clothing",
  "trench coat": "clothing",
  "cardigan": "clothing",
  "sweater": "clothing",
  "pajama": "clothing",
  "bikini": "clothing",
  "swimming trunks": "clothing",
  "lab coat": "clothing",
  "suit": "clothing",
  "hat": "clothing",
  "cap": "clothing",
  "bonnet": "clothing",
  "scarf": "clothing",
  "mitten": "clothing",
  "glove": "clothing",
  "shoe": "clothing",
  "sandal": "clothing",
  "boot": "clothing",
  "sneaker": "clothing",
  "running shoe": "clothing",
  "loafer": "clothing",
  "cowboy boot": "clothing",
  "clog": "clothing",

  // Electronics
  "laptop": "electronics",
  "notebook computer": "electronics",
  "cellular telephone": "electronics",
  "cell phone": "electronics",
  "phone": "electronics",
  "smartphone": "electronics",
  "calculator": "electronics",
  "iPod": "electronics",
  "mouse": "electronics",
  "computer mouse": "electronics",
  "remote control": "electronics",
  "tablet": "electronics",
  "USB": "electronics",
  "flash drive": "electronics",
  "charger": "electronics",
  "power adapter": "electronics",
  "camera": "electronics",
  "digital watch": "electronics",
  "digital clock": "electronics",

  // Keys
  "key": "keys",
  "keychain": "keys",
  "padlock": "keys",
  "combination lock": "keys",
  "lock": "keys",

  // Book
  "book jacket": "book",
  "notebook": "book",
  "binder": "book",
  "comic book": "book",
  "library": "book",
  "bookshop": "book",

  // Lunchbox
  "lunchbox": "lunchbox",
  "lunch box": "lunchbox",
  "container": "lunchbox",
  "Tupperware": "lunchbox",
  "thermos": "lunchbox",

  // Umbrella
  "umbrella": "umbrella",
  "parasol": "umbrella",

  // Sports Equipment
  "tennis ball": "sports_equipment",
  "soccer ball": "sports_equipment",
  "basketball": "sports_equipment",
  "baseball": "sports_equipment",
  "racket": "sports_equipment",
  "tennis racket": "sports_equipment",
  "golf ball": "sports_equipment",
  "volleyball": "sports_equipment",
  "football": "sports_equipment",
  "rugby ball": "sports_equipment",
  "ping-pong ball": "sports_equipment",
  "ski": "sports_equipment",
  "snowboard": "sports_equipment",
  "skateboard": "sports_equipment",
  "dumbbell": "sports_equipment",
  "barbell": "sports_equipment",

  // Jewelry
  "necklace": "jewelry",
  "ring": "jewelry",
  "bracelet": "jewelry",
  "chain": "jewelry",
  "pendant": "jewelry",
  "earring": "jewelry",

  // Glasses
  "sunglass": "glasses",
  "sunglasses": "glasses",
  "eyeglasses": "glasses",
  "spectacles": "glasses",
  "goggles": "glasses",

  // Headphones
  "headphone": "headphones",
  "headphones": "headphones",
  "earphone": "headphones",
  "headset": "headphones",
  "earbud": "headphones",
};

function getCategoryLabel(categoryName: string): string {
  const cat = SCHOOL_CATEGORIES.find((c) => c.name === categoryName);
  return cat?.label ?? "Other";
}

export function mapPredictionsToCategory(
  predictions: AIPrediction[]
): MappedTag[] {
  const results: MappedTag[] = [];

  for (const prediction of predictions) {
    const classNames = prediction.className.toLowerCase().split(",");
    let matched = false;

    for (const name of classNames) {
      const trimmed = name.trim();

      // Try exact match first
      if (LABEL_TO_CATEGORY[trimmed]) {
        results.push({
          category: LABEL_TO_CATEGORY[trimmed],
          label: getCategoryLabel(LABEL_TO_CATEGORY[trimmed]),
          confidence: prediction.probability,
          originalLabel: prediction.className,
        });
        matched = true;
        break;
      }

      // Try partial match
      for (const [keyword, category] of Object.entries(LABEL_TO_CATEGORY)) {
        if (trimmed.includes(keyword) || keyword.includes(trimmed)) {
          results.push({
            category,
            label: getCategoryLabel(category),
            confidence: prediction.probability,
            originalLabel: prediction.className,
          });
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      results.push({
        category: "other",
        label: "Other",
        confidence: prediction.probability,
        originalLabel: prediction.className,
      });
    }
  }

  // Deduplicate by category, keeping highest confidence
  const seen = new Map<string, MappedTag>();
  for (const tag of results) {
    const existing = seen.get(tag.category);
    if (!existing || tag.confidence > existing.confidence) {
      seen.set(tag.category, tag);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
}
