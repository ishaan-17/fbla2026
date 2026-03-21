"use client";

import Link from "next/link";
import type { Item } from "@/types";
import ItemsFocusGrid from "@/components/ItemsFocusGrid";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
} from "@/components/ScrollReveal";

export function ItemsPageHeader({ itemCount }: { itemCount: number }) {
  return (
    <ScrollRevealStagger className="mb-8" staggerDelay={0.1}>
      <ScrollRevealItem>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Found Items
        </h1>
      </ScrollRevealItem>
      <ScrollRevealItem>
        <p className="text-[#E6E6E6] mt-2">
          Displaying {itemCount} item{itemCount !== 1 ? "s" : ""}.
          Spot yours? Click to claim it.
        </p>
      </ScrollRevealItem>
    </ScrollRevealStagger>
  );
}

export function ItemsPageContent({
  items,
  hasFilters,
}: {
  items: Item[];
  hasFilters: boolean;
}) {
  if (items.length > 0) {
    return (
      <ScrollReveal delay={0.2} direction="up">
        <ItemsFocusGrid items={items} />
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal delay={0.2} direction="up">
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-[#E6E6E6] mb-2">
          No items found
        </h2>
        <p className="text-[#E6E6E6] mb-8">
          {hasFilters
            ? "Try adjusting your search or filters."
            : "No items have been listed yet. Be the first to report one!"}
        </p>
        <LiquidButton variant="dark" size="lg" asChild>
          <Link href="/report" className="font-bold tracking-wide">
            Report a Found Item
          </Link>
        </LiquidButton>
      </div>
    </ScrollReveal>
  );
}
