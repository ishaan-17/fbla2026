"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { TagsSelector } from "@/components/ui/tags-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import type { MappedTag } from "@/types";

// Liquid glass validation tooltip component
function ValidationTooltip({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-30 pointer-events-none"
    >
      <div
        className="relative overflow-visible rounded-lg"
        style={{
          boxShadow: `
            0 4px 16px rgba(0, 0, 0, 0.2),
            0 2px 4px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Glass blur layer */}
        <div
          className="absolute inset-0 z-0 rounded-lg"
          style={{
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-10 rounded-lg"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.35) 0%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(255, 255, 255, 0.25) 100%
              )
            `,
          }}
        />

        {/* Inner highlights */}
        <div
          className="absolute inset-0 z-20 rounded-lg pointer-events-none"
          style={{
            boxShadow: `
              inset 1px 1px 2px 0 rgba(255, 255, 255, 0.6),
              inset -1px -1px 2px 0 rgba(255, 255, 255, 0.3)
            `,
          }}
        />

        {/* Border */}
        <div
          className="absolute inset-0 z-[25] rounded-lg pointer-events-none"
          style={{
            border: "1.5px solid rgba(220, 38, 38, 0.7)",
          }}
        />

        {/* Content */}
        <div className="relative z-30 px-3 py-2 text-sm text-white font-semibold whitespace-nowrap">
          {message}
        </div>

        {/* Arrow pointing down */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full z-30"
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    </motion.div>
  );
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [dateFound, setDateFound] = useState<Date | undefined>(new Date());
  const [form, setForm] = useState({
    title: "",
    description: "",
    location_found: "",
    reporter_name: "",
    reporter_email: "",
  });

  // Clear field error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = "Please fill out this field.";
    }
    if (!form.description.trim()) {
      errors.description = "Please fill out this field.";
    }
    if (!form.location_found.trim()) {
      errors.location_found = "Please fill out this field.";
    }
    if (!dateFound) {
      errors.date_found = "Please select a date.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

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
          date_found: dateFound?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
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
    <div className="min-h-screen bg-earth-900 -mt-16 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-3">
            New Report
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report a Found Item
          </h1>
          <p className="text-white/60 mt-3 leading-relaxed">
            Found something? Help it find its owner. Upload a photo and our AI will help categorize it.
            You&apos;ll earn <span className="font-bold text-primary-400">10 points</span> for reporting!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {error && (
            <div className="p-4 text-sm text-red-300 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 shadow-[0_2px_12px_rgba(220,38,38,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Photo</h2>
            <ImageUploader
              onFileSelect={setFile}
              onCategoryDetected={setCategory}
              onTagsDetected={setAiDetectedTags}
            />
          </div>

          {/* Item Details */}
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Item Details</h2>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">
                Item Title <span className="text-primary-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                  placeholder="e.g., Blue water bottle"
                />
                <AnimatePresence>
                  {fieldErrors.title && <ValidationTooltip message={fieldErrors.title} />}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">
                Description <span className="text-primary-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 resize-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                  placeholder="Describe the item — color, brand, size, any distinguishing features..."
                />
                <AnimatePresence>
                  {fieldErrors.description && <ValidationTooltip message={fieldErrors.description} />}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">
                  Category
                  {category && (
                    <span className="ml-2 text-xs text-primary-400 font-normal">AI suggested</span>
                  )}
                </label>
                <DropdownMenu
                  value={category}
                  onChange={setCategory}
                  placeholder="Select a category"
                  options={SCHOOL_CATEGORIES.map((cat) => ({
                    value: cat.name,
                    label: cat.label,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">
                  Date Found <span className="text-primary-400">*</span>
                </label>
                <div className="relative">
                  <DatePicker
                    date={dateFound}
                    onDateChange={(date) => {
                      setDateFound(date);
                      if (fieldErrors.date_found) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.date_found;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Select date found"
                  />
                  <AnimatePresence>
                    {fieldErrors.date_found && <ValidationTooltip message={fieldErrors.date_found} />}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">
                Location Found <span className="text-primary-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.location_found}
                  onChange={(e) => handleFieldChange("location_found", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                  placeholder="e.g., Room 204, Main Hallway, Gym"
                />
                <AnimatePresence>
                  {fieldErrors.location_found && <ValidationTooltip message={fieldErrors.location_found} />}
                </AnimatePresence>
              </div>
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Info</h2>
              <p className="text-sm text-white/50 mt-1">Optional — provide your info to earn reward points</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={form.reporter_name}
                  onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">Your Email</label>
                <input
                  type="email"
                  value={form.reporter_email}
                  onChange={(e) => setForm({ ...form, reporter_email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                  placeholder="your.email@school.edu"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <LiquidButton
              type="submit"
              disabled={submitting}
              variant="dark"
              size="full"
              className="tracking-wide"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Report...
                </span>
              ) : (
                "Submit Report"
              )}
            </LiquidButton>
            <p className="text-xs text-center text-white/40 mt-3">
              Your report will be reviewed by an admin before appearing publicly.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
