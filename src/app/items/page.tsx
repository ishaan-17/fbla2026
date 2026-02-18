import { Suspense } from "react";
import db from "@/lib/db";
import type { Item } from "@/types";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import ItemsFocusGrid from "@/components/ItemsFocusGrid";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ search?: string; category?: string; page?: string; sort?: string }>;
}

// Get ORDER BY clause based on sort option
function getOrderByClause(sort: string): string {
  switch (sort) {
    case "expiring":
      return "ORDER BY date_found ASC";
    case "a-z":
      return "ORDER BY title ASC";
    case "newest":
    default:
      return "ORDER BY created_at DESC";
  }
}

export default async function ItemsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const sort = params.sort || "newest";

  let whereClause = "WHERE status = 'approved'";
  const queryParams: (string | number)[] = [];

  if (category) {
    whereClause += " AND category = ?";
    queryParams.push(category);
  }

  if (search) {
    whereClause +=
      " AND (title LIKE ? OR description LIKE ? OR ai_tags LIKE ?)";
    const pattern = `%${search}%`;
    queryParams.push(pattern, pattern, pattern);
  }

  const countResult = db
    .prepare(`SELECT COUNT(*) as total FROM items ${whereClause}`)
    .get(...queryParams) as { total: number };

  const orderByClause = getOrderByClause(sort);

  // Get all items for parallax scroll (no pagination needed with scroll)
  let items = db
    .prepare(
      `SELECT * FROM items ${whereClause} ${orderByClause} LIMIT 50`,
    )
    .all(...queryParams) as Item[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Found Items
        </h1>
        <p className="text-[#E6E6E6] mt-2">
          Displaying {items.length} item{items.length !== 1 ? "s" : ""}.
          Spot yours? Click to claim it.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Suspense
          fallback={<div className="h-12 bg-earth-100 animate-pulse rounded" />}
        >
          <SearchBar />
        </Suspense>
      </div>

      {/* Results - Parallax Grid */}
      {items.length > 0 ? (
        <ItemsFocusGrid items={items} />
      ) : (
        <div className="text-center py-24">
          <h2 className="text-xl font-bold text-[#E6E6E6] mb-2">
            No items found
          </h2>
          <p className="text-[#E6E6E6] mb-8">
            {search || category
              ? "Try adjusting your search or filters."
              : "No items have been listed yet. Be the first to report one!"}
          </p>
          <LiquidButton variant="dark" size="lg" asChild>
            <Link href="/report" className="font-bold tracking-wide">
              Report a Found Item
            </Link>
          </LiquidButton>
        </div>
      )}
    </div>
  );
}
