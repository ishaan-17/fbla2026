export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  location_found: string;
  date_found: string;
  image_path: string | null;
  reporter_name: string;
  reporter_email: string;
  status: "pending" | "approved" | "claimed" | "archived";
  ai_tags: string | null;
  created_at: string;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_name: string;
  claimant_email: string;
  claimant_description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface ClaimWithItem extends Claim {
  item_title: string;
}

export interface Category {
  id: number;
  name: string;
  label: string;
}

export interface AIPrediction {
  className: string;
  probability: number;
}

export interface MappedTag {
  category: string;
  label: string;
  confidence: number;
  originalLabel: string;
}

export interface Reward {
  id: number;
  email: string;
  name: string;
  points: number;
  reason: string;
  item_id: number | null;
  created_at: string;
}

export interface LeaderboardEntry {
  email: string;
  name: string;
  total_points: number;
  items_reported: number;
}
