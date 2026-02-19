"use client";

import { useState, useCallback } from "react";
import type { MappedTag } from "@/types";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { FileUpload } from "@/components/ui/file-upload";

// Toggle this to enable/disable safe search checking
const ENABLE_SAFE_SEARCH = false;

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onCategoryDetected: (category: string) => void;
  onTagsDetected: (tags: MappedTag[]) => void;
}

// Simulated AI tagging — picks a random category based on file characteristics
function simulateAITagging(): MappedTag[] {
  const possibleCategories = SCHOOL_CATEGORIES.filter(
    (c) => c.name !== "other",
  );
  const numTags = 2 + Math.floor(Math.random() * 2); // 2-3 tags
  const shuffled = [...possibleCategories].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numTags);

  let baseConfidence = 0.75 + Math.random() * 0.2; // 75-95%
  return selected.map((cat) => {
    const tag: MappedTag = {
      category: cat.name,
      label: cat.label,
      confidence: parseFloat(baseConfidence.toFixed(2)),
      originalLabel: `AI detected: ${cat.label.toLowerCase()}`,
    };
    baseConfidence *= 0.6 + Math.random() * 0.2; // decrease for subsequent tags
    return tag;
  });
}

export default function ImageUploader({
  onFileSelect,
  onCategoryDetected,
  onTagsDetected,
}: ImageUploaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tags, setTags] = useState<MappedTag[]>([]);
  const [safeSearchResult, setSafeSearchResult] = useState<object | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const analyzeImage = useCallback(async () => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1000),
    );

    const mappedTags = simulateAITagging();
    setTags(mappedTags);
    onTagsDetected(mappedTags);

    if (mappedTags.length > 0) {
      onCategoryDetected(mappedTags[0].category);
    }
    setIsAnalyzing(false);
  }, [onCategoryDetected, onTagsDetected]);

  const searchSafeImage = useCallback(async (imageBuffer: string) => {
    try {
      const response = await fetch("/api/vision", {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBuffer }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();
      setSafeSearchResult(data);
    } catch (error) {
      console.error("Error during safe image search:", error);
    }
  }, []);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setUploadError(null);

      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image must be under 5MB.");
        return;
      }

      onFileSelect(file);
      setTags([]);
      analyzeImage();
      setSafeSearchResult(null);

      // Use FileReader to convert the File object to a Base64 string
      const reader = new FileReader();

      reader.onloadend = () => {
        // The result will be a Data URL (e.g., "data:image/jpeg;base64,...")
        // Extract just the Base64 part
        const base64Image = (reader.result as string).split(",")[1];

        // Only run safe search if enabled
        if (ENABLE_SAFE_SEARCH) {
          searchSafeImage(base64Image);
        }
      };

      reader.onerror = () => {
        setUploadError("Failed to read image file. Please try again.");
      };

      reader.readAsDataURL(file);
    },
    [onFileSelect, analyzeImage, searchSafeImage],
  );

  return (
    <div className="space-y-4">
      {/* Upload Error */}
      {uploadError && (
        <div
          role="alert"
          className="p-3 rounded-xl text-sm text-red-300 bg-red-500/20 border border-red-500/30"
        >
          {uploadError}
        </div>
      )}

      {/* File Upload */}
      <div className="rounded-2xl overflow-hidden">
        <FileUpload onChange={handleFileUpload} />

        {isAnalyzing && (
          <div
            className="px-6 py-4 -mt-2 rounded-b-2xl border-x border-b border-white/[0.08]"
            style={{
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              background: `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.06) 0%,
                rgba(255, 255, 255, 0.02) 50%,
                rgba(255, 255, 255, 0.04) 100%
              )`,
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-white/70">
                Analyzing image with AI...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Tags */}
      {tags.length > 0 && (
        <div
          className="p-4 rounded-2xl border border-white/[0.08]"
          style={{
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            background: `linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0.03) 50%,
              rgba(255, 255, 255, 0.06) 100%
            )`,
            boxShadow: `
              inset 0 1px 1px 0 rgba(255, 255, 255, 0.06),
              inset 0 -1px 2px 0 rgba(0, 0, 0, 0.03),
              0 4px 16px rgba(0, 0, 0, 0.1)
            `,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-bold text-white/80">
              AI Detected Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/80 rounded-full border border-white/[0.1]"
                style={{
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  background: "rgba(255, 255, 255, 0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {tag.label}
                <span className="text-emerald-400">
                  {Math.round(tag.confidence * 100)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
