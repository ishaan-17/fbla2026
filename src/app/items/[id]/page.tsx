import Link from "next/link";
import db from "@/lib/db";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";
import ClaimForm from "@/components/ClaimForm";
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

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as
    | Item
    | undefined;

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
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-earth-500 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left Column: Image + Details */}
        <div className="lg:col-span-3 space-y-8">
          {/* Image */}
          <div className="bg-earth-100 overflow-hidden">
            {item.image_path ? (
              <img
                src={item.image_path.startsWith('http') ? item.image_path : `/${item.image_path}`}
                alt={item.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <svg className="w-16 h-16 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              <span className="text-xs font-bold uppercase tracking-wider text-earth-400 whitespace-nowrap bg-earth-100 px-3 py-1.5">
                {status.label}
              </span>
            </div>

            <p className="text-earth-600 leading-relaxed mb-8">{item.description}</p>

            <div className="grid grid-cols-2 gap-px bg-earth-200">
              <div className="bg-earth-50 p-5">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm font-semibold text-earth-800">{getCategoryLabel(item.category)}</p>
              </div>
              <div className="bg-earth-50 p-5">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mb-1">Date Found</p>
                <p className="text-sm font-semibold text-earth-800">
                  {new Date(item.date_found).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-earth-50 p-5">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mb-1">Location Found</p>
                <p className="text-sm font-semibold text-earth-800">{item.location_found}</p>
              </div>
              <div className="bg-earth-50 p-5">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mb-1">Listed On</p>
                <p className="text-sm font-semibold text-earth-800">
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* AI Tags */}
            {aiTags.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mb-2">AI-detected tags</p>
                <div className="flex flex-wrap gap-2">
                  {aiTags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Claim Form */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white border border-earth-200 p-6">
            {item.status === "approved" ? (
              <ClaimForm itemId={item.id} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-bold text-earth-700 mb-1">{status.label}</p>
                <p className="text-xs text-earth-400">{status.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
