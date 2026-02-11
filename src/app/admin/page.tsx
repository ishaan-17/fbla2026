"use client";

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import type { Item, ClaimWithItem } from "@/types";
import { getCategoryLabel } from "@/lib/categories";

type Tab = "items" | "claims";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-accent-400 text-earth-900",
    approved: "bg-earth-200 text-earth-700",
    claimed: "bg-primary-100 text-primary-700",
    archived: "bg-earth-100 text-earth-500",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${colors[status] || colors.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<ClaimWithItem[]>([]);
  const [itemFilter, setItemFilter] = useState("");
  const [claimFilter, setClaimFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams({ all: "true", limit: "100" });
    if (itemFilter) params.set("status", itemFilter);
    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();
    setItems(data.items || []);
  }, [itemFilter]);

  const fetchClaims = useCallback(async () => {
    const params = new URLSearchParams();
    if (claimFilter) params.set("status", claimFilter);
    const res = await fetch(`/api/claims?${params}`);
    const data = await res.json();
    setClaims(data.claims || []);
  }, [claimFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchItems(), fetchClaims()]).finally(() => setLoading(false));
  }, [fetchItems, fetchClaims]);

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
    fetchItems();
    fetchClaims();
  };

  const handleClaimAction = async (id: number, action: string) => {
    await fetch(`/api/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    fetchItems();
    fetchClaims();
  };

  const pendingItems = items.filter((i) => i.status === "pending").length;
  const pendingClaims = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-earth-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-earth-500 mt-2">
          Review items and verify claims. Approve items to make them visible. Approve claims to confirm collection.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-earth-200 mb-10">
        {[
          { label: "Pending Items", value: pendingItems, highlight: true },
          { label: "Pending Claims", value: pendingClaims, highlight: true },
          { label: "Total Items", value: items.length, highlight: false },
          { label: "Total Claims", value: claims.length, highlight: false },
        ].map((stat, i) => (
          <div key={i} className="bg-earth-50 p-5">
            <p className={`text-2xl font-extrabold ${stat.highlight ? "text-primary-500" : "text-earth-900"}`}>
              {stat.value}
            </p>
            <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-earth-200 mb-8">
        {(["items", "claims"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors ${
              tab === t
                ? "text-earth-900 border-b-2 border-earth-900"
                : "text-earth-400 hover:text-earth-600"
            }`}
          >
            {t === "items" ? "Items" : "Claims"}
            {t === "items" && pendingItems > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5">
                {pendingItems}
              </span>
            )}
            {t === "claims" && pendingClaims > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5">
                {pendingClaims}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-earth-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "items" ? (
        <div>
          {/* Filter */}
          <div className="mb-6">
            <select
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-earth-300 text-sm text-earth-600 focus:border-earth-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="claimed">Claimed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {items.length > 0 ? (
            <div className="bg-white border border-earth-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-earth-200">
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Item</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Category</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Reporter</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Date</th>
                      <th className="text-right text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-earth-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.image_path ? (
                              <img
                                src={`/${item.image_path}`}
                                alt=""
                                className="w-10 h-10 object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-earth-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-earth-900">{item.title}</p>
                              <p className="text-xs text-earth-400 truncate max-w-[200px]">{item.location_found}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-earth-600">{getCategoryLabel(item.category)}</td>
                        <td className="px-6 py-4 text-sm text-earth-600">{item.reporter_name || "Anonymous"}</td>
                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                        <td className="px-6 py-4 text-sm text-earth-400">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "pending" && (
                              <button
                                onClick={() => handleItemAction(item.id, "approved")}
                                className="px-3 py-1.5 bg-earth-900 text-white text-xs font-bold hover:bg-earth-800 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {(item.status === "pending" || item.status === "approved") && (
                              <button
                                onClick={() => handleItemAction(item.id, "archived")}
                                className="px-3 py-1.5 border border-earth-300 text-earth-600 text-xs font-bold hover:bg-earth-100 transition-colors"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => handleItemAction(item.id, "delete")}
                              className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
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
            <div className="text-center py-16 text-earth-500">No items found.</div>
          )}
        </div>
      ) : (
        <div>
          {/* Filter */}
          <div className="mb-6">
            <select
              value={claimFilter}
              onChange={(e) => setClaimFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-earth-300 text-sm text-earth-600 focus:border-earth-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {claims.length > 0 ? (
            <div className="bg-white border border-earth-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-earth-200">
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Item</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Claimant</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Description</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Date</th>
                      <th className="text-right text-[10px] font-bold text-earth-400 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-earth-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-earth-900">{claim.item_title}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-earth-900">{claim.claimant_name}</p>
                          <p className="text-xs text-earth-400">{claim.claimant_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-earth-600 max-w-[250px] truncate">
                          {claim.claimant_description}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                        <td className="px-6 py-4 text-sm text-earth-400">{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {claim.status === "pending" && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleClaimAction(claim.id, "approved")}
                                className="px-3 py-1.5 bg-earth-900 text-white text-xs font-bold hover:bg-earth-800 transition-colors"
                                title="Verify that the claimant has collected the item"
                              >
                                Verify & Approve
                              </button>
                              <button
                                onClick={() => handleClaimAction(claim.id, "rejected")}
                                className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
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
            <div className="text-center py-16 text-earth-500">No claims found.</div>
          )}
        </div>
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
