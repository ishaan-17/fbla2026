import type { Metadata } from "next";
import db from "@/lib/db";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";
import Image from "next/image";
import Link from "next/link";
import DonationsHero from "@/components/DonationsHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donated Items — Reclaimr",
  description:
    "Items unclaimed after 30 days are donated to God's Promise Charity. See where lost items find a second purpose.",
};

export default async function DonationsPage() {
  // Items eligible for donation: archived, OR approved but older than 30 days
  const donatedItems = db
    .prepare(
      `SELECT * FROM items
       WHERE status = 'archived'
          OR (status = 'approved' AND date_found < date('now', '-30 days'))
       ORDER BY date_found DESC
       LIMIT 50`
    )
    .all() as Item[];

  // Stats
  const totalDonated = donatedItems.length;
  const categoryBreakdown: Record<string, number> = {};
  for (const item of donatedItems) {
    const label = getCategoryLabel(item.category);
    categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1;
  }
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <DonationsHero
        totalDonated={totalDonated}
        totalCategories={Object.keys(categoryBreakdown).length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Category breakdown */}
        {topCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/30 mb-4">
              By Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/8"
                >
                  <span className="text-sm text-white/70">{label}</span>
                  <span className="text-xs font-bold text-white/30 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items grid */}
        {donatedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {donatedItems.map((item) => (
              <DonationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white/60 mb-2">No donations yet</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">
              Items unclaimed for 30 days will appear here once they&apos;re donated.
            </p>
          </div>
        )}

        {/* Info section */}
        <div className="mt-20 border-t border-white/6 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoBlock
              title="How it works"
              text="When a found item goes unclaimed for 30 days, it's removed from active listings and donated to local charities and community organizations."
            />
            <InfoBlock
              title="Where items go"
              text="Donated items are distributed to local shelters, nonprofits, and community organizations where they can be put to good use by those in need."
            />
            <InfoBlock
              title="Prevention"
              text="Label your belongings clearly. Items with identifying marks are returned to their owners far more often."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function DonationCard({ item }: { item: Item }) {
  const donatedDate = new Date(item.date_found);
  donatedDate.setDate(donatedDate.getDate() + 30);

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <div className="relative rounded-lg overflow-hidden bg-white/3 border border-white/6 transition-all duration-200 hover:border-white/12 hover:bg-white/5">
        {/* Image */}
        <div className="relative aspect-square bg-earth-900/50 overflow-hidden">
          {item.image_path ? (
            <Image
              src={
                item.image_path.startsWith("http")
                  ? item.image_path
                  : `/${item.image_path}`
              }
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white/10"
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

          {/* Donated badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-primary-500/90 text-white rounded shadow-[0_2px_8px_rgba(98,125,152,0.4)]">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Donated
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-white/30 font-medium">
              {getCategoryLabel(item.category)}
            </span>
            <span className="text-[11px] text-white/20 tabular-nums">
              {donatedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Info Block ──────────────────────────────────────────────────────────────

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white/50 mb-2">{title}</h3>
      <p className="text-sm text-white/25 leading-relaxed">{text}</p>
    </div>
  );
}
