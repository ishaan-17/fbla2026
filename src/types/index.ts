import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

// Supabase-derived type aliases for database operations
export type DbItem = Tables<"items">;
export type DbItemInsert = TablesInsert<"items">;
export type DbItemUpdate = TablesUpdate<"items">;

export type DbClaim = Tables<"claims">;
export type DbClaimInsert = TablesInsert<"claims">;
export type DbClaimUpdate = TablesUpdate<"claims">;

export type DbCategory = Tables<"categories">;
export type DbCategoryInsert = TablesInsert<"categories">;

export type DbReward = Tables<"rewards">;
export type DbRewardInsert = TablesInsert<"rewards">;
export type DbRewardUpdate = TablesUpdate<"rewards">;

export type DbInquiry = Tables<"inquiries">;
export type DbInquiryInsert = TablesInsert<"inquiries">;
export type DbInquiryUpdate = TablesUpdate<"inquiries">;

// Re-export database utility types
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";
export type { Database, Json } from "@/lib/supabase/database.types";

// Existing hand-written interfaces (used by current SQLite code)
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

export interface Inquiry {
  id: number;
  item_id: number;
  inquirer_name: string;
  inquirer_email: string;
  message: string;
  status: "pending" | "read" | "replied";
  created_at: string;
}

export interface InquiryWithItem extends Inquiry {
  item_title: string;
}
