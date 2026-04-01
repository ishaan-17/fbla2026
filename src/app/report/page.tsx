"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { TagsSelector } from "@/components/ui/tags-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { TabSwitch } from "@/components/ui/tab-switch";
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import type { MappedTag } from "@/types";

interface ReportedItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
  status: string;
  created_at: string;
}

interface LostItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
  status: string;
  created_at: string;
}

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
        <div
          className="absolute inset-0 z-0 rounded-lg"
          style={{
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
          }}
        />
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
        <div
          className="absolute inset-0 z-20 rounded-lg pointer-events-none"
          style={{
            boxShadow: `
              inset 1px 1px 2px 0 rgba(255, 255, 255, 0.6),
              inset -1px -1px 2px 0 rgba(255, 255, 255, 0.3)
            `,
          }}
        />
        <div
          className="absolute inset-0 z-[25] rounded-lg pointer-events-none"
          style={{ border: "1.5px solid rgba(220, 38, 38, 0.7)" }}
        />
        <div
          id={id}
          role="alert"
          className="relative z-30 px-3 py-2 text-sm text-white font-semibold whitespace-nowrap"
        >
          {message}
        </div>
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
  { id: "small", label: "Small", category: "size" as const },
  { id: "medium", label: "Medium", category: "size" as const },
  { id: "large", label: "Large", category: "size" as const },
  { id: "metal", label: "Metal", category: "material" as const },
  { id: "plastic", label: "Plastic", category: "material" as const },
  { id: "fabric", label: "Fabric", category: "material" as const },
  { id: "leather", label: "Leather", category: "material" as const },
  { id: "glass", label: "Glass", category: "material" as const },
  { id: "wood", label: "Wood", category: "material" as const },
  { id: "electronics", label: "Electronics", category: "type" as const },
  { id: "valuable", label: "Valuable", category: "type" as const },
  { id: "keys", label: "Keys", category: "type" as const },
  { id: "jewelry", label: "Jewelry", category: "type" as const },
  { id: "branded", label: "Branded", category: "type" as const },
];

const TABS = [
  { id: "found", label: "I Found Something" },
  { id: "lost", label: "I Lost Something" },
];

// Item card component for sidebar
function ItemCard({ item, type }: { item: ReportedItem | LostItem; type: "found" | "lost" }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    searching: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    found: "bg-green-500/20 text-green-400 border-green-500/30",
    claimed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
    searching: "Searching",
    found: "Found",
    claimed: "Claimed",
  };

  // image_path is already a full URL from upload, or could be a legacy relative path
  const imageUrl = item.image_path
    ? item.image_path.startsWith("http")
      ? item.image_path
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`
    : null;

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      {imageUrl ? (
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          <Image
            src={imageUrl}
            alt={item.title}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-white/5 flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
        <p className="text-xs text-white/50 truncate">{item.description}</p>
        <span
          className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${
            statusColors[item.status] || "bg-white/10 text-white/60 border-white/20"
          }`}
        >
          {statusLabels[item.status] || item.status}
        </span>
      </div>
    </div>
  );
}

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  
  // Tab state (default to "found", but check URL param)
  const initialTab = searchParams.get("tab") === "lost" ? "lost" : "found";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Session loading state
  const isSessionLoading = sessionStatus === "loading";

  // Common state
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [aiDetectedTags, setAiDetectedTags] = useState<MappedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<
    { id: string; label: string; category?: "color" | "size" | "material" | "type" | "other" }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Found item form state
  const [dateFound, setDateFound] = useState<Date | undefined>(new Date());
  const [foundForm, setFoundForm] = useState({
    title: "",
    description: "",
    location_found: "",
  });

  // Lost item form state
  const [dateLost, setDateLost] = useState<Date | undefined>(new Date());
  const [lostForm, setLostForm] = useState({
    title: "",
    description: "",
    location_lost: "",
  });

  // User's reported items
  const [myReportedItems, setMyReportedItems] = useState<ReportedItem[]>([]);
  const [myLostItems, setMyLostItems] = useState<LostItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

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

  // Fetch user's items
  const fetchMyItems = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoadingItems(true);
    try {
      const [reportedRes, lostRes] = await Promise.all([
        fetch(`/api/items?all=true&reporter_email=${encodeURIComponent(session.user.email)}`),
        fetch(`/api/lost-items?email=${encodeURIComponent(session.user.email)}`),
      ]);

      if (reportedRes.ok) {
        const data = await reportedRes.json();
        setMyReportedItems(data.items || []);
      }

      if (lostRes.ok) {
        const data = await lostRes.json();
        setMyLostItems(data || []);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoadingItems(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  // Reset form when tab changes
  useEffect(() => {
    setFile(null);
    setCategory("");
    setAiDetectedTags([]);
    setSelectedTags([]);
    setError("");
    setFieldErrors({});
  }, [activeTab]);

  // Add AI tags when detected
  useEffect(() => {
    if (aiDetectedTags.length > 0) {
      const newTags = aiDetectedTags.map((t) => ({
        id: t.label.toLowerCase().replace(/\s+/g, "-"),
        label: t.label,
        category: t.category as "color" | "size" | "material" | "type" | "other" | undefined,
      }));
      setSelectedTags((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const uniqueNewTags = newTags.filter((t) => !existingIds.has(t.id));
        return [...prev, ...uniqueNewTags];
      });
    }
  }, [aiDetectedTags]);

  const handleFieldChange = (form: "found" | "lost", field: string, value: string) => {
    if (form === "found") {
      setFoundForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setLostForm((prev) => ({ ...prev, [field]: value }));
    }
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateFoundForm = () => {
    const errors: Record<string, string> = {};
    if (!foundForm.title.trim()) errors.title = "Please fill out this field.";
    if (!foundForm.description.trim()) errors.description = "Please fill out this field.";
    if (!foundForm.location_found.trim()) errors.location_found = "Please fill out this field.";
    if (!dateFound) errors.date_found = "Please select a date.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLostForm = () => {
    const errors: Record<string, string> = {};
    if (!lostForm.title.trim()) errors.title = "Please fill out this field.";
    if (!lostForm.description.trim()) errors.description = "Please fill out this field.";
    if (!session?.user?.email) errors.email = "Please sign in to submit";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFoundForm()) return;

    setSubmitting(true);
    setError("");

    try {
      let imagePath: string | null = null;
      let imageEmbedding: number[] | null = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        imagePath = uploadData.path;
        imageEmbedding = uploadData.embedding || null;
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...foundForm,
          date_found: dateFound?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          category: category || "other",
          image_path: imagePath,
          image_embedding: imageEmbedding,
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

  const handleLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLostForm()) return;

    setSubmitting(true);
    setError("");

    try {
      let imagePath: string | null = null;
      let imageEmbedding: number[] | null = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        imagePath = uploadData.path;
        imageEmbedding = uploadData.embedding || null;
      }

      const res = await fetch("/api/lost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lostForm,
          date_lost: dateLost?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          category: category || "other",
          image_path: imagePath,
          image_embedding: imageEmbedding,
          ai_tags: selectedTags.map((t) => t.label),
          reporter_name: session?.user?.name || "",
          reporter_email: session?.user?.email || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      router.push("/lost/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const currentItems = activeTab === "found" ? myReportedItems : myLostItems;

  return (
    <div className="min-h-screen bg-[#121212] -mt-16 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Section */}
          <div className="flex-1 max-w-2xl">
            {/* Header with Tabs */}
            <ScrollRevealStagger className="mb-8" staggerDelay={0.1}>
              <ScrollRevealItem>
                <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-3">
                  Report
                </p>
              </ScrollRevealItem>
              <ScrollRevealItem>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                  {activeTab === "found" ? "Report a Found Item" : "Report a Lost Item"}
                </h1>
              </ScrollRevealItem>
              <ScrollRevealItem>
                <TabSwitch
                  tabs={TABS}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </ScrollRevealItem>
              <ScrollRevealItem>
                <p className="text-white/60 mt-4 leading-relaxed">
                  {activeTab === "found" ? (
                    <>
                      Found something? Help it find its owner. Upload a photo and our AI
                      will help categorize it. You&apos;ll earn{" "}
                      <span className="font-bold text-primary-400">10 points</span> for
                      reporting!
                    </>
                  ) : (
                    <>
                      Lost something? Describe what you lost and we&apos;ll try to match it 
                      with found items. You&apos;ll be notified if we find a match!
                    </>
                  )}
                </p>
              </ScrollRevealItem>
            </ScrollRevealStagger>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 text-sm text-red-300 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Found Item Form */}
            <AnimatePresence mode="wait">
              {activeTab === "found" && (
                <motion.form
                  key="found-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleFoundSubmit}
                  className="space-y-8"
                  noValidate
                >
                  {/* Image Upload */}
                  <ScrollReveal delay={0.1} direction="up">
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
                  <ScrollReveal delay={0.15} direction="up">
                    <div className="space-y-5">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Item Details
                      </h2>

                      <div>
                        <label htmlFor="found-title" className="block text-sm font-semibold text-white/80 mb-1.5">
                          Item Title <span className="text-primary-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="found-title"
                            type="text"
                            value={foundForm.title}
                            onChange={(e) => handleFieldChange("found", "title", e.target.value)}
                            aria-invalid={!!fieldErrors.title}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
                            placeholder="e.g., Blue water bottle"
                          />
                          <AnimatePresence>
                            {fieldErrors.title && <ValidationTooltip message={fieldErrors.title} />}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="found-description" className="block text-sm font-semibold text-white/80 mb-1.5">
                          Description <span className="text-primary-400">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="found-description"
                            value={foundForm.description}
                            onChange={(e) => handleFieldChange("found", "description", e.target.value)}
                            rows={3}
                            aria-invalid={!!fieldErrors.description}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 resize-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
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
                            {category && <span className="ml-2 text-xs text-primary-400 font-normal">AI suggested</span>}
                          </label>
                          <DropdownMenu
                            value={category}
                            onChange={setCategory}
                            placeholder="Select a category"
                            options={SCHOOL_CATEGORIES.map((cat) => ({ value: cat.name, label: cat.label }))}
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
                        <label htmlFor="found-location" className="block text-sm font-semibold text-white/80 mb-1.5">
                          Location Found <span className="text-primary-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="found-location"
                            type="text"
                            value={foundForm.location_found}
                            onChange={(e) => handleFieldChange("found", "location_found", e.target.value)}
                            aria-invalid={!!fieldErrors.location_found}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
                            placeholder="e.g., Room A101, Rally Court, Gym"
                          />
                          <AnimatePresence>
                            {fieldErrors.location_found && <ValidationTooltip message={fieldErrors.location_found} />}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div>
                        <TagsSelector
                          tags={COMMON_TAGS}
                          selectedTags={selectedTags}
                          onSelectionChange={setSelectedTags}
                          title={aiDetectedTags.length > 0 ? "Tags (AI suggested)" : "Tags"}
                        />
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Submit */}
                  <ScrollReveal delay={0.2} direction="up">
                    <div className="pt-2">
                      <LiquidButton type="submit" disabled={submitting} variant="dark" size="full">
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
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
                </motion.form>
              )}

              {/* Lost Item Form */}
              {activeTab === "lost" && (
                <motion.form
                  key="lost-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLostSubmit}
                  className="space-y-8"
                  noValidate
                >
                  {/* Image Upload (Optional) */}
                  <ScrollReveal delay={0.1} direction="up">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                        Photo (Optional)
                      </h2>
                      <p className="text-sm text-white/50 mb-4">
                        If you have a photo of the item, upload it to help us find better matches.
                      </p>
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
                  <ScrollReveal delay={0.15} direction="up">
                    <div className="space-y-5">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Item Details
                      </h2>

                      <div>
                        <label htmlFor="lost-title" className="block text-sm font-semibold text-white/80 mb-1.5">
                          What did you lose? <span className="text-primary-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="lost-title"
                            type="text"
                            value={lostForm.title}
                            onChange={(e) => handleFieldChange("lost", "title", e.target.value)}
                            aria-invalid={!!fieldErrors.title}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
                            placeholder="e.g., Blue water bottle, iPhone charger"
                          />
                          <AnimatePresence>
                            {fieldErrors.title && <ValidationTooltip message={fieldErrors.title} />}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lost-description" className="block text-sm font-semibold text-white/80 mb-1.5">
                          Description <span className="text-primary-400">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="lost-description"
                            value={lostForm.description}
                            onChange={(e) => handleFieldChange("lost", "description", e.target.value)}
                            rows={4}
                            aria-invalid={!!fieldErrors.description}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 resize-none bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
                            placeholder="Describe the item in detail - color, brand, any distinguishing features..."
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
                          </label>
                          <DropdownMenu
                            value={category}
                            onChange={setCategory}
                            placeholder="Select category"
                            options={SCHOOL_CATEGORIES.map((cat) => ({ value: cat.name, label: cat.label }))}
                          />
                        </div>

                        <div>
                          <label htmlFor="lost-location" className="block text-sm font-semibold text-white/80 mb-1.5">
                            Where did you lose it?
                          </label>
                          <input
                            id="lost-location"
                            type="text"
                            value={lostForm.location_lost}
                            onChange={(e) => handleFieldChange("lost", "location_lost", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2)] focus:outline-none focus:border-white/30"
                            placeholder="e.g., Library, Gym, Cafeteria"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white/80 mb-1.5">
                          When did you lose it?
                        </label>
                        <DatePicker date={dateLost} onDateChange={setDateLost} />
                      </div>

                      <div>
                        <TagsSelector
                          tags={COMMON_TAGS}
                          selectedTags={selectedTags}
                          onSelectionChange={setSelectedTags}
                          title={aiDetectedTags.length > 0 ? "Tags (AI suggested)" : "Tags (helps with matching)"}
                        />
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Submit */}
                  <ScrollReveal delay={0.2} direction="up">
                    <div className="pt-2">
                      {!isSessionLoading && !session?.user?.email && (
                        <p className="text-amber-400/80 text-sm mb-4">
                          ⚠️ Please sign in to submit a lost item report
                        </p>
                      )}
                      <LiquidButton type="submit" disabled={submitting || isSessionLoading || !session?.user?.email} variant="dark" size="full">
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : isSessionLoading ? (
                          "Loading..."
                        ) : (
                          "Submit Lost Item Report"
                        )}
                      </LiquidButton>
                    </div>
                  </ScrollReveal>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - User's Items */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ScrollReveal delay={0.2} direction="right">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    {activeTab === "found" ? "Your Reported Items" : "Your Lost Items"}
                  </h3>

                  {isSessionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : !session?.user?.email ? (
                    <p className="text-sm text-white/50">Sign in to see your items</p>
                  ) : loadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : currentItems.length === 0 ? (
                    <p className="text-sm text-white/50">
                      {activeTab === "found"
                        ? "You haven't reported any found items yet."
                        : "You haven't reported any lost items yet."}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {currentItems.map((item) => (
                        <ItemCard key={item.id} item={item} type={activeTab as "found" | "lost"} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
