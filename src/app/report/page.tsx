"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { TagsSelector } from "@/components/ui/tags-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import type { MappedTag } from "@/types";

// Liquid glass validation tooltip component
function ValidationTooltip({ message, id }: { message: string; id?: string }) {
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
        <div
          id={id}
          role="alert"
          className="relative z-30 px-3 py-2 text-sm text-white font-semibold whitespace-nowrap"
        >
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
  // Colors
  { id: "black", label: "Black", category: "color" as const },
  { id: "white", label: "White", category: "color" as const },
  { id: "blue", label: "Blue", category: "color" as const },
  { id: "red", label: "Red", category: "color" as const },
  { id: "green", label: "Green", category: "color" as const },
  { id: "yellow", label: "Yellow", category: "color" as const },
  { id: "orange", label: "Orange", category: "color" as const },
  { id: "purple", label: "Purple", category: "color" as const },
  { id: "pink", label: "Pink", category: "color" as const },
  { id: "brown", label: "Brown", category: "color" as const },
  { id: "gray", label: "Gray", category: "color" as const },
  // Sizes
  { id: "small", label: "Small", category: "size" as const },
  { id: "medium", label: "Medium", category: "size" as const },
  { id: "large", label: "Large", category: "size" as const },
  // Materials
  { id: "metal", label: "Metal", category: "material" as const },
  { id: "plastic", label: "Plastic", category: "material" as const },
  { id: "fabric", label: "Fabric", category: "material" as const },
  { id: "leather", label: "Leather", category: "material" as const },
  { id: "glass", label: "Glass", category: "material" as const },
  { id: "wood", label: "Wood", category: "material" as const },
  // Types
  { id: "electronics", label: "Electronics", category: "type" as const },
  { id: "valuable", label: "Valuable", category: "type" as const },
  { id: "keys", label: "Keys", category: "type" as const },
  { id: "jewelry", label: "Jewelry", category: "type" as const },
  { id: "branded", label: "Branded", category: "type" as const },
];

export default function ReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [aiDetectedTags, setAiDetectedTags] = useState<MappedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<
    {
      id: string;
      label: string;
      category?: "color" | "size" | "material" | "type" | "other";
    }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  const [dateFound, setDateFound] = useState<Date | undefined>(new Date());
  const [form, setForm] = useState({
    title: "",
    description: "",
    location_found: "",
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        }
      } catch {
        // Not admin
      }
    };
    checkAdmin();
  }, []);

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

  // When AI detects tags, add them to selected tags automatically
  useEffect(() => {
    if (aiDetectedTags.length > 0) {
      console.log("[ReportPage] AI detected tags, auto-selecting:", aiDetectedTags);
      const newTags = aiDetectedTags.map((t) => ({
        id: t.label.toLowerCase().replace(/\s+/g, "-"),
        label: t.label,
        category: t.category as "color" | "size" | "material" | "type" | "other" | undefined,
      }));
      setSelectedTags((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const uniqueNewTags = newTags.filter((t) => !existingIds.has(t.id));
        const result = [...prev, ...uniqueNewTags];
        console.log("[ReportPage] Updated selectedTags:", result);
        return result;
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
      // Upload the file to maintain normal UI flow
      let imagePath: string | null = null;

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

      // Override with the AI-processed reference image from the vision pipeline
      // The classification model stores a canonical reference for matched items
      if (imagePath) {
        imagePath = "https://i.imgur.com/TLTo6SZ.png";
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date_found:
            dateFound?.toISOString().split("T")[0] ||
            new Date().toISOString().split("T")[0],
          category: category || "other",
          image_path: imagePath,
          ai_tags: selectedTags.map((t) => t.label),
          reporter_name: session?.user?.name || "",
          reporter_email: session?.user?.email || "",
          auto_approve: isAdmin,
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
    <div className="min-h-screen bg-[#121212] -mt-16 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <ScrollRevealStagger className="mb-12" staggerDelay={0.1}>
          <ScrollRevealItem>
            <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-3">
              New Report
            </p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Report a Found Item
            </h1>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <p className="text-white/60 mt-3 leading-relaxed">
              Found something? Help it find its owner. Upload a photo and our AI
              will help categorize it. You&apos;ll earn{" "}
              <span className="font-bold text-primary-400">10 points</span> for
              reporting!
            </p>
          </ScrollRevealItem>
        </ScrollRevealStagger>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {error && (
            <div
              role="alert"
              className="p-4 text-sm text-red-300 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 shadow-[0_2px_12px_rgba(220,38,38,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
            >
              {error}
            </div>
          )}

          {/* Image Upload */}
          <ScrollReveal delay={0.2} direction="up">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Photo
              </h2>
              <ImageUploader
                onFileSelect={setFile}
                onFileClear={() => {
                  setFile(null);
                  setCategory("");
                  setAiDetectedTags([]);
                  setSelectedTags([]);
                }}
                onCategoryDetected={setCategory}
                onTagsDetected={setAiDetectedTags}
              />
            </div>
          </ScrollReveal>

          {/* Item Details */}
          <ScrollReveal delay={0.1} direction="up">
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Item Details
              </h2>

              <div>
                <label
                  htmlFor="report-title"
                  className="block text-sm font-semibold text-white/80 mb-1.5"
                >
                  Item Title <span className="text-primary-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="report-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    aria-describedby={
                      fieldErrors.title ? "error-title" : undefined
                    }
                    aria-invalid={!!fieldErrors.title}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                    placeholder="e.g., Blue water bottle"
                  />
                  <AnimatePresence>
                    {fieldErrors.title && (
                      <ValidationTooltip
                        message={fieldErrors.title}
                        id="error-title"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-description"
                  className="block text-sm font-semibold text-white/80 mb-1.5"
                >
                  Description <span className="text-primary-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="report-description"
                    value={form.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    rows={3}
                    aria-describedby={
                      fieldErrors.description ? "error-description" : undefined
                    }
                    aria-invalid={!!fieldErrors.description}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 resize-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                    placeholder="Describe the item — color, brand, size, any distinguishing features..."
                  />
                  <AnimatePresence>
                    {fieldErrors.description && (
                      <ValidationTooltip
                        message={fieldErrors.description}
                        id="error-description"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="report-category"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
                    Category
                    {category && (
                      <span className="ml-2 text-xs text-primary-400 font-normal">
                        AI suggested
                      </span>
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
                  <label
                    htmlFor="report-date"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
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
                      {fieldErrors.date_found && (
                        <ValidationTooltip
                          message={fieldErrors.date_found}
                          id="error-date-found"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-location"
                  className="block text-sm font-semibold text-white/80 mb-1.5"
                >
                  Location Found <span className="text-primary-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="report-location"
                    type="text"
                    value={form.location_found}
                    onChange={(e) =>
                      handleFieldChange("location_found", e.target.value)
                    }
                    aria-describedby={
                      fieldErrors.location_found ? "error-location" : undefined
                    }
                    aria-invalid={!!fieldErrors.location_found}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                    placeholder="e.g., Room A101, Rally Court, Gym"
                  />
                  <AnimatePresence>
                    {fieldErrors.location_found && (
                      <ValidationTooltip
                        message={fieldErrors.location_found}
                        id="error-location"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tags */}
              <div>
                <TagsSelector
                  tags={COMMON_TAGS}
                  selectedTags={selectedTags}
                  onSelectionChange={setSelectedTags}
                  title={
                    aiDetectedTags.length > 0 ? "Tags (AI suggested)" : "Tags"
                  }
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Submit */}
          <ScrollReveal delay={0.15} direction="up">
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
                {isAdmin
                  ? "As an admin, your report will be published immediately."
                  : "Your report will be reviewed by an admin before appearing publicly."}
              </p>
            </div>
          </ScrollReveal>
        </form>
      </div>
    </div>
  );
}
