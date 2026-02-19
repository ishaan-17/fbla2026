"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Recently Added" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "a-z", label: "Title A-Z" },
];

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const updateSearch = useCallback(
    (newSearch: string, newCategory: string, newSort: string) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      if (newSort && newSort !== "newest") params.set("sort", newSort);
      router.push(`/items?${params.toString()}`);
    },
    [router],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch(search, category, sort);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    setSort("newest");
    router.push("/items");
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateSearch(search, value, sort);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateSearch(search, category, value);
  };

  // Category options for dropdown
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...SCHOOL_CATEGORIES.map((cat) => ({
      value: cat.name,
      label: cat.label,
    })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      role="search"
      aria-label="Search lost items"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search input - liquid glass style */}
        <div className="relative flex-1 h-[46px]">
          <label htmlFor="search-items" className="sr-only">
            Search for lost items
          </label>
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 z-10 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="search-items"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for lost items..."
            className="w-full h-[46px] pl-11 pr-4 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Category filter - liquid glass dropdown */}
        <div className="min-w-[160px] h-[46px]">
          <DropdownMenu
            value={category}
            onChange={handleCategoryChange}
            placeholder="All Categories"
            options={categoryOptions}
          />
        </div>

        {/* Sort dropdown */}
        <div className="min-w-[160px] h-[46px]">
          <DropdownMenu
            value={sort}
            onChange={handleSortChange}
            placeholder="Sort by"
            options={SORT_OPTIONS}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 h-[46px]">
          <button
            type="submit"
            className="h-[46px] px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] hover:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] hover:bg-white/15 hover:border-white/30"
          >
            Search
          </button>
          {(search || category) && (
            <button
              type="button"
              onClick={handleClear}
              className="h-[46px] px-5 rounded-xl text-sm font-semibold text-white/80 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] hover:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] hover:bg-white/15 hover:text-white hover:border-white/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
