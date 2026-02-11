"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SCHOOL_CATEGORIES } from "@/lib/categories";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const updateSearch = useCallback(
    (newSearch: string, newCategory: string) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      router.push(`/items?${params.toString()}`);
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch(search, category);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    router.push("/items");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for lost items..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateSearch(search, e.target.value);
          }}
          className="px-4 py-3 bg-white border border-earth-300 text-sm text-earth-600 focus:border-earth-900 focus:outline-none min-w-[160px] cursor-pointer"
        >
          <option value="">All Categories</option>
          {SCHOOL_CATEGORIES.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-6 py-3 bg-earth-900 text-white text-sm font-bold tracking-wide hover:bg-earth-800 transition-colors"
          >
            Search
          </button>
          {(search || category) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 border border-earth-300 text-earth-600 text-sm font-semibold hover:bg-earth-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
