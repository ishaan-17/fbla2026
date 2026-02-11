"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { TagsSelector } from "@/components/ui/tags-selector";
import type { MappedTag } from "@/types";

// Common tags for lost & found items
const COMMON_TAGS = [
  { id: "black", label: "Black" },
  { id: "blue", label: "Blue" },
  { id: "red", label: "Red" },
  { id: "white", label: "White" },
  { id: "green", label: "Green" },
  { id: "branded", label: "Branded" },
  { id: "small", label: "Small" },
  { id: "large", label: "Large" },
  { id: "metal", label: "Metal" },
  { id: "plastic", label: "Plastic" },
  { id: "fabric", label: "Fabric" },
  { id: "leather", label: "Leather" },
  { id: "electronics", label: "Electronics" },
  { id: "valuable", label: "Valuable" },
  { id: "keys", label: "Keys" },
  { id: "jewelry", label: "Jewelry" },
];

export default function ReportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [aiDetectedTags, setAiDetectedTags] = useState<MappedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ id: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location_found: "",
    date_found: new Date().toISOString().split("T")[0],
    reporter_name: "",
    reporter_email: "",
  });

  // When AI detects tags, add them to selected tags
  useEffect(() => {
    if (aiDetectedTags.length > 0) {
      const newTags = aiDetectedTags.map((t) => ({
        id: t.label.toLowerCase().replace(/\s+/g, "-"),
        label: t.label,
      }));
      setSelectedTags((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const uniqueNewTags = newTags.filter((t) => !existingIds.has(t.id));
        return [...prev, ...uniqueNewTags];
      });
    }
  }, [aiDetectedTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let imagePath = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        imagePath = uploadData.path;
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: category || "other",
          image_path: imagePath,
          ai_tags: selectedTags.map((t) => t.label),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      router.push("/report/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
          New Report
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-earth-900 tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-earth-500 mt-3 leading-relaxed">
          Found something? Help it find its owner. Upload a photo and our AI will help categorize it.
          You&apos;ll earn <span className="font-bold text-primary-500">10 points</span> for reporting!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <h2 className="text-sm font-bold text-earth-900 uppercase tracking-wider mb-4">Photo</h2>
          <ImageUploader
            onFileSelect={setFile}
            onCategoryDetected={setCategory}
            onTagsDetected={setAiDetectedTags}
          />
        </div>

        {/* Item Details */}
        <div className="space-y-5">
          <h2 className="text-sm font-bold text-earth-900 uppercase tracking-wider">Item Details</h2>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">
              Item Title <span className="text-primary-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
              placeholder="e.g., Blue water bottle"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">
              Description <span className="text-primary-500">*</span>
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors resize-none"
              placeholder="Describe the item — color, brand, size, any distinguishing features..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">
                Category
                {category && (
                  <span className="ml-2 text-xs text-primary-500 font-normal">AI suggested</span>
                )}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-600 focus:border-earth-900 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">Select a category</option>
                {SCHOOL_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">
                Date Found <span className="text-primary-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date_found}
                onChange={(e) => setForm({ ...form, date_found: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 focus:border-earth-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">
              Location Found <span className="text-primary-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.location_found}
              onChange={(e) => setForm({ ...form, location_found: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
              placeholder="e.g., Room 204, Main Hallway, Gym"
            />
          </div>

          {/* Tags */}
          <div>
            <TagsSelector
              tags={COMMON_TAGS}
              selectedTags={selectedTags}
              onSelectionChange={setSelectedTags}
              title={aiDetectedTags.length > 0 ? "Tags (AI suggested)" : "Tags"}
            />
          </div>
        </div>

        {/* Reporter Info */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-earth-900 uppercase tracking-wider">Your Info</h2>
            <p className="text-sm text-earth-400 mt-1">Optional — provide your info to earn reward points</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Your Name</label>
              <input
                type="text"
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Your Email</label>
              <input
                type="email"
                value={form.reporter_email}
                onChange={(e) => setForm({ ...form, reporter_email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
                placeholder="your.email@school.edu"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-earth-900 text-white text-sm font-bold tracking-wide hover:bg-earth-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Report...
              </span>
            ) : (
              "Submit Report"
            )}
          </button>
          <p className="text-xs text-center text-earth-400 mt-3">
            Your report will be reviewed by an admin before appearing publicly.
          </p>
        </div>
      </form>
    </div>
  );
}
