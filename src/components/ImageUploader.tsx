"use client";

import { useState, useCallback, useEffect } from "react";
import type { MappedTag } from "@/types";
import { FileUpload } from "@/components/ui/file-upload";
import {
  classifyImage,
  loadClassifier,
  getClassifierStatus,
  type ClassificationResult,
} from "@/lib/aiClassifier";

// Toggle this to enable/disable safe search checking
const ENABLE_SAFE_SEARCH = false;

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  onCategoryDetected: (category: string) => void;
  onTagsDetected: (tags: MappedTag[]) => void;
}

/**
 * Convert AI classification results to the MappedTag format used by the app
 */
function resultsToTags(results: ClassificationResult[]): MappedTag[] {
  return results.map((r) => ({
    category: r.category,
    label: r.tag,
    confidence: r.confidence,
    originalLabel: `AI detected: ${r.originalLabel}`,
  }));
}

export default function ImageUploader({
  onFileSelect,
  onFileClear,
  onCategoryDetected,
  onTagsDetected,
}: ImageUploaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [tags, setTags] = useState<MappedTag[]>([]);
  const [safeSearchResult, setSafeSearchResult] = useState<object | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileClear = useCallback(() => {
    setTags([]);
    setSafeSearchResult(null);
    setUploadError(null);
    onFileClear?.();
  }, [onFileClear]);

  // Preload the classifier model when component mounts
  useEffect(() => {
    if (getClassifierStatus() === "idle") {
      setIsLoadingModel(true);
      loadClassifier((progress) => setLoadProgress(progress))
        .then(() => setIsLoadingModel(false))
        .catch(() => setIsLoadingModel(false));
    }
  }, []);

  const analyzeImage = useCallback(
    async (file: File) => {
      console.log("[ImageUploader] Starting AI analysis for:", file.name);
      setIsAnalyzing(true);
      setLoadProgress(0);

      try {
        // Run real AI classification
        console.log("[ImageUploader] Calling classifyImage...");
        const { tags: results, suggestedCategory } = await classifyImage(file, (progress) => {
          console.log("[ImageUploader] Progress:", progress);
          setLoadProgress(progress);
        });

        console.log("[ImageUploader] Classification results:", results);
        console.log("[ImageUploader] Suggested category:", suggestedCategory);
        
        const mappedTags = resultsToTags(results);
        console.log("[ImageUploader] Mapped tags:", mappedTags);
        
        setTags(mappedTags);
        onTagsDetected(mappedTags);

        // Use the detected category from SCHOOL_CATEGORIES
        if (suggestedCategory) {
          onCategoryDetected(suggestedCategory);
        }
      } catch (error) {
        console.error("[ImageUploader] AI classification error:", error);
        setUploadError(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onCategoryDetected, onTagsDetected],
  );

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
      setSafeSearchResult(null);

      // Run AI classification directly on the file
      analyzeImage(file);

      // Safe search still needs base64, only run if enabled
      if (ENABLE_SAFE_SEARCH) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64Image = dataUrl.split(",")[1];
          searchSafeImage(base64Image);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect, analyzeImage, searchSafeImage],
  );

  return (
    <div className="space-y-4">
      {/* Model Loading Indicator (first time only) */}
      {isLoadingModel && (
        <div
          className="p-4 rounded-xl border border-white/[0.08]"
          style={{
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            background: `linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.06) 0%,
              rgba(255, 255, 255, 0.02) 50%,
              rgba(255, 255, 255, 0.04) 100%
            )`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-primary-400/50 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-white/70">
              Loading AI model...
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            First-time setup • Model will be cached for future use
          </p>
        </div>
      )}

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
        <FileUpload onChange={handleFileUpload} onClear={handleFileClear} />

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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-white/70">
                {loadProgress < 100 ? "Loading AI model..." : "Analyzing image..."}
              </span>
            </div>
            {loadProgress < 100 && (
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 rounded-full transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
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
