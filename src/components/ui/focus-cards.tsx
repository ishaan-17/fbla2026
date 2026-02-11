"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: {
      title: string;
      src: string;
      description?: string;
      badge?: string;
      meta?: string;
    };
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-earth-100 overflow-hidden h-72 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      {card.src ? (
        <img
          src={card.src}
          alt={card.title}
          className="object-cover absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-earth-200">
          <svg className="w-16 h-16 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Badge */}
      {card.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-bold px-3 py-1 bg-primary-500 text-white rounded">
            {card.badge}
          </span>
        </div>
      )}

      {/* Hover overlay with description */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-sm text-white/80 line-clamp-3 mb-3">
            {card.description}
          </p>
        )}
        {card.meta && (
          <p className="text-xs text-white/60">
            {card.meta}
          </p>
        )}
      </div>

      {/* Title always visible at bottom when not hovered */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity duration-300",
          hovered === index ? "opacity-0" : "opacity-100"
        )}
      >
        <h3 className="text-lg font-bold text-white truncate">
          {card.title}
        </h3>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type CardType = {
  title: string;
  src: string;
  description?: string;
  badge?: string;
  meta?: string;
};

export function FocusCards({ cards }: { cards: CardType[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title + index}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
