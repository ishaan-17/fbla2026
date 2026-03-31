"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import PasswordGate from "@/components/PasswordGate";
import type { Item, ClaimWithItem, InquiryWithItem } from "@/types";
import { getCategoryLabel } from "@/lib/categories";

type Tab = "items" | "claims" | "inquiries";

/* ─── Item Detail Modal ─────────────────────────────────────────────────── */

function ItemDetailModal({
  item,
  onClose,
  onAction,
}: {
  item: Item;
  onClose: () => void;
  onAction: (id: number, action: string) => void;
}) {
  const aiTags: string[] = Array.isArray(item.ai_tags)
    ? item.ai_tags.map(String)
    : [];

  const foundDate = new Date(item.date_found);
  const expiryDate = new Date(foundDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const daysLeft = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft > 0 && daysLeft <= 7;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-neutral-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {item.image_path && (
          <div className="relative w-full h-[300px] bg-neutral-800 rounded-t-xl overflow-hidden">
            <Image
              src={
                item.image_path.startsWith("http")
                  ? item.image_path
                  : `/${item.image_path}`
              }
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-contain"
              unoptimized={!item.image_path.startsWith("http")}
            />
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {item.title}
            </h2>
            <StatusBadge status={item.status} />
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-white/70 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="bg-neutral-800 rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <div className="p-4 border-r border-b sm:border-b-0 border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Category
                </p>
                <p className="text-sm font-semibold text-white">
                  {getCategoryLabel(item.category)}
                </p>
              </div>
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Days Left
                </p>
                <p className={`text-sm font-semibold ${isExpired ? "text-red-400" : isUrgent ? "text-amber-400" : "text-white"}`}>
                  {isExpired ? "Expired" : `${daysLeft} days`}
                </p>
              </div>
              <div className="p-4 border-r border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-sm font-semibold text-white">
                  {item.location_found}
                </p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Date Found
                </p>
                <p className="text-sm font-semibold text-white">
                  {new Date(item.date_found).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Reporter + AI Tags */}
          <div className="flex items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Reporter
                </p>
                <p className="text-sm font-semibold text-white">
                  {item.reporter_name || "Anonymous"}
                </p>
                {item.reporter_email && (
                  <p className="text-xs text-white/40">{item.reporter_email}</p>
                )}
              </div>
            </div>

            {aiTags.length > 0 && (
              <>
                <div className="w-px self-stretch bg-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                    AI Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs font-semibold capitalize rounded-full border border-primary-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {item.status === "pending" && (
              <button
                onClick={() => { onAction(item.id, "approved"); onClose(); }}
                className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Approve
              </button>
            )}
            {(item.status === "pending" || item.status === "approved") && (
              <button
                onClick={() => { onAction(item.id, "archived"); onClose(); }}
                className="px-4 py-2 border border-white/20 text-white/70 text-sm font-bold rounded-lg hover:bg-white/10 transition-colors"
              >
                Archive
              </button>
            )}
            <button
              onClick={() => { onAction(item.id, "delete"); onClose(); }}
              className="px-4 py-2 border border-red-500/30 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/10 transition-colors ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    claimed: "bg-primary-500/10 text-primary-400 border-primary-500/20",
    archived: "bg-white/5 text-white/40 border-white/10",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    read: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    replied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors[status] || colors.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<ClaimWithItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryWithItem[]>([]);
  const [itemFilter, setItemFilter] = useState("");
  const [claimFilter, setClaimFilter] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Tab indicator animation
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<Tab, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeTab = tabRefs.current.get(tab);
    if (activeTab && tabsRef.current) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [tab, items, claims, inquiries]);

  const fetchItems = useCallback(async (): Promise<Item[]> => {
    const params = new URLSearchParams({ all: "true", limit: "100" });
    if (itemFilter) params.set("status", itemFilter);
    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();
    return data.items || [];
  }, [itemFilter]);

  const fetchClaims = useCallback(async (): Promise<ClaimWithItem[]> => {
    const params = new URLSearchParams();
    if (claimFilter) params.set("status", claimFilter);
    const res = await fetch(`/api/claims?${params}`);
    const data = await res.json();
    return data.claims || [];
  }, [claimFilter]);

  const fetchInquiries = useCallback(async (): Promise<InquiryWithItem[]> => {
    const params = new URLSearchParams();
    if (inquiryFilter) params.set("status", inquiryFilter);
    const res = await fetch(`/api/inquiries?${params}`);
    const data = await res.json();
    return data.inquiries || [];
  }, [inquiryFilter]);

  // Standalone function that fetches all data and updates state (for use in event handlers)
  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [newItems, newClaims, newInquiries] = await Promise.all([
      fetchItems(),
      fetchClaims(),
      fetchInquiries(),
    ]);
    setItems(newItems);
    setClaims(newClaims);
    setInquiries(newInquiries);
    setLoading(false);
  }, [fetchItems, fetchClaims, fetchInquiries]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchItems(), fetchClaims(), fetchInquiries()]).then(
      ([newItems, newClaims, newInquiries]) => {
        if (cancelled) return;
        setItems(newItems);
        setClaims(newClaims);
        setInquiries(newInquiries);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [fetchItems, fetchClaims, fetchInquiries]);

  const handleItemAction = async (id: number, action: string) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this item?")) return;
      await fetch(`/api/items/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
    }
    refreshAll();
  };

  const handleClaimAction = async (id: number, action: string) => {
    await fetch(`/api/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    refreshAll();
  };

  const handleInquiryAction = async (id: number, action: string) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this inquiry?")) return;
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
    }
    refreshAll();
  };

  const pendingItems = items.filter((i) => i.status === "pending").length;
  const pendingClaims = claims.filter((c) => c.status === "pending").length;
  const pendingInquiries = inquiries.filter(
    (i) => i.status === "pending",
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-white/50 mt-2">
          Review items and verify claims. Approve items to make them visible.
          Approve claims to confirm collection.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="bg-neutral-800 rounded-xl border border-white/10 overflow-hidden mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3">
          <div className="p-5 border-r border-b border-white/10">
            <p className="text-2xl font-extrabold text-primary-400">
              {pendingItems}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              Pending Items
            </p>
          </div>
          <div className="p-5 border-b sm:border-r border-white/10">
            <p className="text-2xl font-extrabold text-primary-400">
              {pendingClaims}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              Pending Claims
            </p>
          </div>
          <div className="p-5 border-r sm:border-r-0 border-b border-white/10">
            <p className="text-2xl font-extrabold text-primary-400">
              {pendingInquiries}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              New Inquiries
            </p>
          </div>
          <div className="p-5 border-r border-white/10">
            <p className="text-2xl font-extrabold text-primary-400">
              {items.length}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              Total Items
            </p>
          </div>
          <div className="p-5 sm:border-r border-white/10">
            <p className="text-2xl font-extrabold text-primary-400">
              {claims.length}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              Total Claims
            </p>
          </div>
          <div className="p-5">
            <p className="text-2xl font-extrabold text-primary-400">
              {inquiries.length}
            </p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              Total Inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Admin dashboard sections"
        className="relative flex gap-6 border-b border-white/10 mb-8"
      >
        {(["items", "claims", "inquiries"] as Tab[]).map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            ref={(el) => {
              if (el) tabRefs.current.set(t, el);
            }}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tabpanel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded ${
              tab === t ? "text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "items" ? "Items" : t === "claims" ? "Claims" : "Inquiries"}
            {t === "items" && pendingItems > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingItems}
              </span>
            )}
            {t === "claims" && pendingClaims > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingClaims}
              </span>
            )}
            {t === "inquiries" && pendingInquiries > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingInquiries}
              </span>
            )}
          </button>
        ))}
        {/* Animated indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary-400 transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>

      <div aria-live="polite" className="sr-only" role="status">
        {!loading && tab === "items" && `Showing ${items.length} items`}
        {!loading && tab === "claims" && `Showing ${claims.length} claims`}
        {!loading &&
          tab === "inquiries" &&
          `Showing ${inquiries.length} inquiries`}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"
            aria-label="Loading"
            role="status"
          />
        </div>
      ) : tab === "items" ? (
        <div
          id="tabpanel-items"
          role="tabpanel"
          aria-labelledby="tab-items"
          tabIndex={0}
        >
          {/* Filter */}
          <div className="mb-6">
            <label htmlFor="item-status-filter" className="sr-only">
              Filter items by status
            </label>
            <select
              id="item-status-filter"
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              className="px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white focus:border-primary-400 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="claimed">Claimed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {items.length > 0 ? (
            <div className="bg-neutral-800 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Reported items list</caption>
                  <thead>
                    <tr className="border-b border-white/10">
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Reporter
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.image_path ? (
                              <Image
                                src={
                                  item.image_path.startsWith("http")
                                    ? item.image_path
                                    : `/${item.image_path}`
                                }
                                alt={item.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded-lg"
                                unoptimized={
                                  !item.image_path.startsWith("http")
                                }
                              />
                            ) : (
                              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white/40"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {item.title}
                              </p>
                              <p className="text-xs text-white/40 truncate max-w-[200px]">
                                {item.location_found}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {getCategoryLabel(item.category)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {item.reporter_name || "Anonymous"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-white/40">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleItemAction(item.id, "approved")
                                }
                                className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {(item.status === "pending" ||
                              item.status === "approved") && (
                              <button
                                onClick={() =>
                                  handleItemAction(item.id, "archived")
                                }
                                className="px-3 py-1.5 border border-white/20 text-white/70 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleItemAction(item.id, "delete")
                              }
                              className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-white/50 bg-neutral-800 rounded-xl border border-white/10">
              No items found.
            </div>
          )}
        </div>
      ) : tab === "claims" ? (
        <div
          id="tabpanel-claims"
          role="tabpanel"
          aria-labelledby="tab-claims"
          tabIndex={0}
        >
          {/* Filter */}
          <div className="mb-6">
            <label htmlFor="claim-status-filter" className="sr-only">
              Filter claims by status
            </label>
            <select
              id="claim-status-filter"
              value={claimFilter}
              onChange={(e) => setClaimFilter(e.target.value)}
              className="px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white focus:border-primary-400 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {claims.length > 0 ? (
            <div className="bg-neutral-800 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Claims list</caption>
                  <thead>
                    <tr className="border-b border-white/10">
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Claimant
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.map((claim) => (
                      <tr
                        key={claim.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {claim.item_title}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-white">
                            {claim.claimant_name}
                          </p>
                          <p className="text-xs text-white/40">
                            {claim.claimant_email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70 max-w-[250px] truncate">
                          {claim.claimant_description}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-white/40">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {claim.status === "pending" && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleClaimAction(claim.id, "approved")
                                }
                                className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors"
                                title="Verify that the claimant has collected the item"
                              >
                                Verify & Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleClaimAction(claim.id, "rejected")
                                }
                                className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-white/50 bg-neutral-800 rounded-xl border border-white/10">
              No claims found.
            </div>
          )}
        </div>
      ) : (
        <div
          id="tabpanel-inquiries"
          role="tabpanel"
          aria-labelledby="tab-inquiries"
          tabIndex={0}
        >
          {/* Filter */}
          <div className="mb-6">
            <label htmlFor="inquiry-status-filter" className="sr-only">
              Filter inquiries by status
            </label>
            <select
              id="inquiry-status-filter"
              value={inquiryFilter}
              onChange={(e) => setInquiryFilter(e.target.value)}
              className="px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-lg text-sm text-white focus:border-primary-400 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {inquiries.length > 0 ? (
            <div className="bg-neutral-800 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Inquiries list</caption>
                  <thead>
                    <tr className="border-b border-white/10">
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        From
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Message
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="text-left text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider px-6 py-4"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {inquiry.item_title}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-white">
                            {inquiry.inquirer_name}
                          </p>
                          <p className="text-xs text-white/40">
                            {inquiry.inquirer_email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70 max-w-[300px]">
                          <p className="line-clamp-2">{inquiry.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inquiry.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-white/40">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {inquiry.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleInquiryAction(inquiry.id, "read")
                                }
                                className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Mark Read
                              </button>
                            )}
                            {(inquiry.status === "pending" ||
                              inquiry.status === "read") && (
                              <button
                                onClick={() =>
                                  handleInquiryAction(inquiry.id, "replied")
                                }
                                className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors"
                              >
                                Mark Replied
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleInquiryAction(inquiry.id, "delete")
                              }
                              className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-white/50 bg-neutral-800 rounded-xl border border-white/10">
              No inquiries found.
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={handleItemAction}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <PasswordGate>
      <AdminDashboard />
    </PasswordGate>
  );
}
