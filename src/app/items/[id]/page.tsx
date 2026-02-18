import Link from "next/link";
import db from "@/lib/db";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";
import ClaimForm from "@/components/ClaimForm";
import CollapsibleInquiry from "@/components/CollapsibleInquiry";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
  let item = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as
    | Item
    | undefined;

  // Fall back to mock items if not found in database
  if (!item) {
    const mockItems = getMockItems();
    item = mockItems.find((m) => m.id === parseInt(id, 10));
  }

  if (!item) {
    notFound();
  }

  const status = statusConfig[item.status] || statusConfig.pending;
  const aiTags = item.ai_tags ? JSON.parse(item.ai_tags) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left Column: Image + Details */}
        <div className="lg:col-span-3 space-y-8">
          {/* Image */}
          <div className="bg-neutral-800 rounded-xl overflow-hidden border border-white/10">
            {item.image_path ? (
              <img
                src={
                  item.image_path.startsWith("http")
                    ? item.image_path
                    : `/${item.image_path}`
                }
                alt={item.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {item.title}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 whitespace-nowrap bg-primary-500/10 border border-primary-500/20 rounded-full px-3 py-1.5">
                {status.label}
              </span>
            </div>

            <p className="text-white/70 leading-relaxed mb-8">
              {item.description}
            </p>

            <div className="bg-neutral-800 rounded-xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-5 border-r border-b border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {getCategoryLabel(item.category)}
                  </p>
                </div>
                <div className="p-5 border-b border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    Days Left
                  </p>
                  {(() => {
                    const createdDate = new Date(item.created_at);
                    const expiryDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const today = new Date();
                    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysLeft <= 7;
                    return (
                      <p className={`text-sm font-semibold ${isUrgent ? "text-amber-400" : "text-white"}`}>
                        {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
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
            <div className="mt-6 flex items-start gap-6">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        </div>

        {/* Right Column: Claim Form & Inquiry Form */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="bg-neutral-800 border border-white/10 rounded-xl p-6">
              {item.status === "approved" ? (
                <ClaimForm itemId={item.id} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-white mb-1">
                    {status.label}
                  </p>
                  <p className="text-xs text-white/50">{status.description}</p>
                </div>
              )}
            </div>

            <CollapsibleInquiry itemId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
