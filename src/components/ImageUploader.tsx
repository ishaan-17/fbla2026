"use client";

import { useState, useCallback } from "react";
import type { MappedTag } from "@/types";
import { SCHOOL_CATEGORIES } from "@/lib/categories";
import { FileUpload } from "@/components/ui/file-upload";

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
      console.log("DATA SAFE SEARCH:", data);
      setSafeSearchResult(data);
    } catch (error) {
      console.error("Error during safe image search:", error);
    }
  }, []);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB");
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
        searchSafeImage(base64Image);
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Failed to read image file.");
      };

      reader.readAsDataURL(file);
    },
    [onFileSelect, analyzeImage, searchSafeImage],
  );

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="border border-dashed border-earth-300 rounded-lg overflow-hidden bg-white">
        <FileUpload onChange={handleFileUpload} />

        {isAnalyzing && (
          <div className="px-6 py-4 bg-earth-50 border-t border-earth-200">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-earth-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-earth-900">
                Analyzing image with AI...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Tags */}
      {tags.length > 0 && (
        <div className="bg-earth-100 p-4 border border-earth-200">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-bold text-earth-900">
              AI Detected Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-semibold text-earth-700 border border-earth-200 rounded-[4px]"
              >
                {tag.label}
                <span className="text-primary-500">
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
