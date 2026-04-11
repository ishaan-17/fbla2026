import Link from "next/link";
import Image from "next/image";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";
import { getDisplayDaysLeft } from "@/lib/expiry";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Available",
  claimed: "Claimed",
  archived: "Archived",
};

export default function ItemCard({ item }: { item: Item }) {
  const daysLeft =
    item.status === "approved" ? getDisplayDaysLeft(item.date_found) : null;

  return (
    <Link href={`/items/${item.id}`}>
      <div className="group bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-earth-100 overflow-hidden">
          {item.image_path ? (
            <Image
              src={
                item.image_path.startsWith("http")
                  ? item.image_path
                  : `/${item.image_path}`
              }
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              unoptimized={!item.image_path.startsWith("http")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-earth-300"
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
          {/* Expiring badge */}
          {daysLeft !== null && daysLeft <= 15 && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-bold px-3 py-1 bg-primary-500 text-white">
                {`${daysLeft}d left`}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-earth-900 group-hover:text-primary-600 transition-colors">
              {item.title}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-earth-400 whitespace-nowrap mt-0.5">
              {statusLabels[item.status] || "Pending"}
            </span>
          </div>

          <p className="text-sm text-earth-500 line-clamp-2 mb-3">
            {item.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-earth-400">
            <span className="font-semibold text-earth-600 bg-earth-100 px-2 py-0.5">
              {getCategoryLabel(item.category)}
            </span>
            <span>{item.location_found}</span>
            <span>{new Date(item.date_found).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
