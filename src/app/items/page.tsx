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
        title: "Steel Water Bottle",
        description: "Stainless steel water bottle with school logo sticker",
        category: "water-bottles",
        location_found: "Gym",
        date_found: today,
        image_path:
          "https://media.discordapp.net/attachments/954109830338052156/1472704707054141667/image.png?ex=69938aa3&is=69923923&hm=86ade180304532a35d1a6035432df144d57a38957669614a1f2b4caf3134e501&=&format=webp&quality=lossless&width=2213&height=1236",
        reporter_name: "John Doe",
        reporter_email: "john@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["water bottle", "white", "stainless steel"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Pink Backpack",
        description: "JanSport backpack with math textbook inside",
        category: "bags",
        location_found: "Library",
        date_found: today,
        image_path:
          "https://media.discordapp.net/attachments/954109830338052156/1472705914292404285/image.png?ex=69938bc3&is=69923a43&hm=02e62ed316ee926c3e19756bfda1b2f0f246d0c2e9eb4cab05a2b7889e7ef972&=&format=webp&quality=lossless&width=2407&height=1340",
        reporter_name: "Jane Smith",
        reporter_email: "jane@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["backpack", "pink", "JanSport"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Scientific Calculator",
        description: "TI-84 Plus calculator with initials 'MJ' on the back",
        category: "school-supplies",
        location_found: "Math Classroom 205",
        date_found: today,
        image_path:
          "https://media.discordapp.net/attachments/954109830338052156/1472705970483237098/image.png?ex=69938bd0&is=69923a50&hm=35ad1bf904181ea5d9e066ccba5680b2214692eb4bb1f0585a687abe4cd745a7&=&format=webp&quality=lossless&width=2396&height=1340",
        reporter_name: "Mike Johnson",
        reporter_email: "mike@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["calculator", "electronics"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Purple Hoodie",
        description: "Champion brand purple hoodie, size medium",
        category: "clothing",
        location_found: "Cafeteria",
        date_found: today,
        image_path:
          "https://media.discordapp.net/attachments/954109830338052156/1472706007749755046/image.png?ex=69938bd9&is=69923a59&hm=03964831dc124c312c91c75fa7b7d9abc5cadc430a8e145087051d554519b912&=&format=webp&quality=lossless&width=2400&height=1340",
        reporter_name: "Sarah Wilson",
        reporter_email: "sarah@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["hoodie", "purple", "Champion"]),
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        title: "AirPods Max",
        description: "Blue AirPods Max headphones",
        category: "electronics",
        location_found: "Student Center",
        date_found: today,
        image_path:
          "https://media.discordapp.net/attachments/954109830338052156/1472706874510938143/image.png?ex=69938ca8&is=69923b28&hm=499a12854db08ef6e365f5d8a0302f79b3768740d03f95e9f879293d9ee4f3b4&=&format=webp&quality=lossless&width=1993&height=1109",
        reporter_name: "David Lee",
        reporter_email: "david@school.edu",
        status: "approved",
        ai_tags: JSON.stringify(["AirPods", "blue", "Apple"]),
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
