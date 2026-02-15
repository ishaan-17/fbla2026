import { Suspense } from "react";
import db from "@/lib/db";
import type { Item } from "@/types";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import ItemsFocusGrid from "@/components/ItemsFocusGrid";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

export default async function ItemsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";

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

  // Get all items for parallax scroll (no pagination needed with scroll)
  let items = db
    .prepare(
      `SELECT * FROM items ${whereClause} ORDER BY created_at DESC LIMIT 50`,
    )
    .all(...queryParams) as Item[];

  // Add temporary mock items if database is empty
  if (items.length === 0 && !search && !category) {
    const today = new Date().toISOString().split("T")[0];
    items = [
      {
        id: 1,
        title: "Blue Water Bottle",
        description: "Stainless steel water bottle with school logo sticker",
        category: "water-bottles",
        location_found: "Gym",
        date_found: today,
        image_path:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
        reporter_name: "John Doe",
        reporter_email: "john@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["water bottle", "blue", "stainless steel"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Black Backpack",
        description: "JanSport backpack with math textbook inside",
        category: "bags",
        location_found: "Library",
        date_found: today,
        image_path:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
        reporter_name: "Jane Smith",
        reporter_email: "jane@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["backpack", "black", "JanSport"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Graphing Calculator",
        description: "TI-84 Plus calculator with initials 'MJ' on the back",
        category: "school-supplies",
        location_found: "Math Classroom 205",
        date_found: today,
        image_path:
          "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800",
        reporter_name: "Mike Johnson",
        reporter_email: "mike@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["calculator", "TI-84", "electronics"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Red Hoodie",
        description: "Champion brand red hoodie, size medium",
        category: "clothing",
        location_found: "Cafeteria",
        date_found: today,
        image_path:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        reporter_name: "Sarah Wilson",
        reporter_email: "sarah@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["hoodie", "red", "Champion"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        title: "AirPods Case",
        description: "White AirPods Pro charging case, no earbuds inside",
        category: "electronics",
        location_found: "Student Center",
        date_found: today,
        image_path:
          "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
        reporter_name: "David Lee",
        reporter_email: "david@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["AirPods", "case", "white", "Apple"]),
        created_at: new Date().toISOString(),
      },
    ] as Item[];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Found Items
        </h1>
        <p className="text-[#E6E6E6] mt-2">
          Browse {countResult.total} item{countResult.total !== 1 ? "s" : ""}{" "}
          currently listed. Spot yours? Click to claim it.
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
