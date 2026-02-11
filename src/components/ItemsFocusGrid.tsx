"use client";
import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Item } from "@/types";
import { getCategoryLabel } from "@/lib/categories";

function getDaysRemaining(dateFound: string): number {
  const found = new Date(dateFound);
  const now = new Date();
  const diffMs = now.getTime() - found.getTime();
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - daysPassed);
}

const ItemCard = React.memo(
  ({
    item,
    index,
    hovered,
    setHovered,
  }: {
    item: Item;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    const daysLeft = item.status === "approved" ? getDaysRemaining(item.date_found) : null;
    const isUrgent = daysLeft !== null && daysLeft <= 7;

    return (
      <Link href={`/items/${item.id}`}>
        <div
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "rounded-lg relative bg-earth-100 overflow-hidden h-72 md:h-80 w-full transition-all duration-300 ease-out cursor-pointer",
            hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
          )}
        >
          {item.image_path ? (
            <img
              src={`/${item.image_path}`}
              alt={item.title}
              className="object-cover absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-earth-200">
              <svg className="w-16 h-16 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Urgent badge */}
          {isUrgent && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-xs font-bold px-3 py-1 bg-primary-500 text-white rounded">
                {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="text-xs font-semibold px-2 py-1 bg-white/90 text-earth-700 rounded backdrop-blur-sm">
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Hover overlay with full details */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-earth-900/90 via-earth-900/50 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300",
              hovered === index ? "opacity-100" : "opacity-0"
            )}
          >
            <h3 className="text-xl font-bold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-white/80 line-clamp-3 mb-3">
              {item.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>{item.location_found}</span>
              <span>•</span>
              <span>{new Date(item.date_found).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Title visible when not hovered */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300",
              hovered === index ? "opacity-0" : "opacity-100"
            )}
          >
            <h3 className="text-lg font-bold text-white truncate">
              {item.title}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {item.location_found}
            </p>
          </div>
        </div>
      </Link>
    );
  }
);

ItemCard.displayName = "ItemCard";

export default function ItemsFocusGrid({ items }: { items: Item[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
