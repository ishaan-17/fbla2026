import { Suspense } from "react";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import type { Item } from "@/types";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import ItemsFocusGrid from "@/components/ItemsFocusGrid";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Found Items — Reclaimr",
  description:
    "Search and browse lost items reported by the school community. Filter by category, keyword, or sort order to find your belongings.",
};

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ItemsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const sort = params.sort || "newest";

  const supabase = await createServiceClient();

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "approved");

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Apply sorting
  switch (sort) {
    case "expiring":
      query = query.order("date_found", { ascending: true });
      break;
    case "a-z":
      query = query.order("title", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.limit(50);

  const { data: items, error } = await query;

  if (error) {
    console.error("Error fetching items:", error);
  }

  const displayItems = (items || []) as Item[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Found Items
        </h1>
        <p className="text-[#E6E6E6] mt-2">
          Displaying {displayItems.length} item{displayItems.length !== 1 ? "s" : ""}. Spot
          yours? Click to claim it.
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
      {displayItems.length > 0 ? (
        <ItemsFocusGrid items={displayItems} />
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
