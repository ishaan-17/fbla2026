import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";
import { getDisplayDaysLeft } from "@/lib/expiry";
import {
  CollapsibleProvider,
  CollapsibleClaim,
  CollapsibleInquiry,
} from "@/components/CollapsibleSections";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServiceClient();
  
  const { data: item } = await supabase
    .from("items")
    .select("title, description, category, location_found")
    .eq("id", parseInt(id, 10))
    .single();

  if (!item) {
    return {
      title: "Item Not Found — Reclaimr",
      description: "This item could not be found in our database.",
    };
  }

  return {
    title: `${item.title} — Reclaimr`,
    description: `${item.description} Found at ${item.location_found}. Category: ${getCategoryLabel(item.category)}.`,
  };
}

const statusConfig: Record<string, { label: string; description: string }> = {
  pending: {
    label: "Pending Review",
    description: "This item is waiting for admin approval.",
  },
  approved: {
    label: "Available",
    description: "This item is available for claiming.",
  },
  claimed: {
    label: "Claimed",
    description: "This item has been claimed and verified.",
  },
  archived: {
    label: "Archived",
    description: "This item is no longer available.",
  },
};

// Mock items for when database is empty (same as items/page.tsx)
function getMockItems(): Item[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: 1,
      title: "Steel Water Bottle",
      description: "Stainless steel water bottle with school logo sticker",
      category: "water-bottles",
      location_found: "Gym",
      date_found: today,
      image_path: "https://i.imgur.com/lFBmvfK.png",
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
      image_path: "https://i.imgur.com/FvXBGb2.png",
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
      image_path: "https://i.imgur.com/swqqEV3.png",
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
      image_path: "https://i.imgur.com/pv9TfEb.png",
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
      image_path: "https://i.imgur.com/mBRZP8i.png",
      reporter_name: "David Lee",
      reporter_email: "david@school.edu",
      status: "approved",
      ai_tags: JSON.stringify(["AirPods", "blue", "Apple"]),
      created_at: new Date().toISOString(),
    },
  ];
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  
  let item: Item | undefined;
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (data) {
    item = data as Item;
  }

  // Fall back to mock items if not found in database
  if (!item) {
    const mockItems = getMockItems();
    item = mockItems.find((m) => m.id === parseInt(id, 10));
  }

  if (!item) {
    notFound();
  }

  const status = statusConfig[item.status] || statusConfig.pending;
  const aiTags = item.ai_tags ? (typeof item.ai_tags === 'string' ? JSON.parse(item.ai_tags) : item.ai_tags) : [];

  return (
    <CollapsibleProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back link */}
        <Link
          href="/items"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all items
        </Link>

        {/* Top Row: Image/Title/Description + Claim Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image + Title + Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-neutral-800 rounded-xl overflow-hidden border border-white/10">
              {item.image_path ? (
                <div className="relative w-full h-[367px]">
                  <Image
                    src={
                      item.image_path.startsWith("http")
                        ? item.image_path
                        : `/${item.image_path}`
                    }
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    unoptimized={!item.image_path.startsWith("http")}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-white/20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                  {item.title}
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-400 whitespace-nowrap bg-primary-500/10 border border-primary-500/20 rounded-full px-3 py-1.5 mt-[15px]">
                  {status.label}
                </span>
              </div>
              <p className="text-white/70 leading-relaxed mt-3">
                {item.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="bg-neutral-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4">
                <div className="p-5 border-r border-b sm:border-b-0 border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {getCategoryLabel(item.category)}
                  </p>
                </div>
                <div className="p-5 border-b sm:border-b-0 sm:border-r border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Days Left
                  </p>
                  {(() => {
                    const daysLeft = getDisplayDaysLeft(item.date_found);
                    const isUrgent = daysLeft <= 7;
                    return (
                      <p
                        className={`text-sm font-semibold ${isUrgent ? "text-amber-400" : "text-white"}`}
                      >
                        {`${daysLeft} days`}
                      </p>
                    );
                  })()}
                </div>
                <div className="p-5 border-r border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Location Found
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {item.location_found}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Listed On
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Posted By & AI Tags */}
            <div className="flex items-start gap-6">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                  <svg
                    className="w-5 h-5 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Posted By
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {item.reporter_name || "Anonymous"}
                  </p>
                </div>
              </div>

              {aiTags.length > 0 && (
                <>
                  <div className="w-px self-stretch bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                      AI-detected tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-xs font-semibold capitalize rounded-full border border-primary-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Claim & Inquiry */}
          <div className="lg:col-span-1 ml-[19px] space-y-3">
            <CollapsibleClaim
              itemId={item.id}
              itemStatus={item.status}
              statusLabel={status.label}
              statusDescription={status.description}
            />
            <CollapsibleInquiry itemId={item.id} />
          </div>
        </div>
      </div>
    </CollapsibleProvider>
  );
}
