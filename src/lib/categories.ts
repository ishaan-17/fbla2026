export const SCHOOL_CATEGORIES = [
  { name: "water_bottle", label: "Water Bottle" },
  { name: "pencil_case", label: "Pencil Case" },
  { name: "backpack", label: "Backpack" },
  { name: "clothing", label: "Clothing" },
  { name: "electronics", label: "Electronics" },
  { name: "keys", label: "Keys" },
  { name: "book", label: "Book" },
  { name: "lunchbox", label: "Lunchbox" },
  { name: "umbrella", label: "Umbrella" },
  { name: "sports_equipment", label: "Sports Equipment" },
  { name: "jewelry", label: "Jewelry" },
  { name: "glasses", label: "Glasses" },
  { name: "headphones", label: "Headphones" },
  { name: "other", label: "Other" },
] as const;

export type CategoryName = (typeof SCHOOL_CATEGORIES)[number]["name"];

export function getCategoryLabel(name: string): string {
  const cat = SCHOOL_CATEGORIES.find((c) => c.name === name);
  return cat?.label ?? "Other";
}
