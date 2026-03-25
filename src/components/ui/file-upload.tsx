"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, ImageIcon, Camera, FolderOpen, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({
  onChange,
  onClear,
}: {
  onChange?: (files: File[]) => void;
  onClear?: () => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleRemoveFile = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== idx));
    // Reset the file inputs so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    onClear?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: () => {
      // Silently handle rejected files (e.g., wrong type or too large)
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        className="relative block cursor-pointer w-full overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          id="camera-upload-handle"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        {/* Outer liquid glass container */}
        <div
          className="relative p-6 rounded-2xl overflow-hidden border border-white/[0.08]"
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
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.06)
            `,
          }}
        >
          {/* Top section with icon and text */}
          <div className="flex items-start gap-4 mb-5">
            {/* Glass Icon */}
            <div
              className="relative flex-shrink-0 w-[4em] h-[4em] group/icon"
              style={{ perspective: "24em", transformStyle: "preserve-3d" }}
            >
              {/* Gradient background layer */}
              <span
                className="absolute top-0 left-0 w-full h-full rounded-[1em] block transition-all duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] group-hover/icon:rotate-[25deg] group-hover/icon:translate-x-[-0.4em] group-hover/icon:translate-y-[-0.4em]"
                style={{
                  background:
                    "linear-gradient(hsl(0, 0%, 45%), hsl(0, 0%, 25%))",
                  boxShadow: "0.4em -0.4em 0.6em hsla(0, 0%, 10%, 0.25)",
                }}
              />
              {/* Frosted glass layer with icon */}
              <span
                className="absolute top-0 left-0 w-full h-full rounded-[1em] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] group-hover/icon:translate-z-[1.5em]"
                style={{
                  background: "hsla(0, 0%, 100%, 0.15)",
                  backdropFilter: "blur(0.75em)",
                  WebkitBackdropFilter: "blur(0.75em)",
                  boxShadow: "0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset",
                }}
              >
                <Cloud className="w-7 h-7 text-white" strokeWidth={1.5} />
              </span>
            </div>

            {/* Text content */}
            <div className="pt-2 ml-3.5">
              <h3 className="text-xl font-bold text-white mb-1 mt-1">
                Upload files
              </h3>
              <p className="text-sm text-white/50 font-medium">
                Drag & drop, browse files, or take a photo
              </p>
            </div>
          </div>

          {/* Inner drop zone - liquid glass style */}
          <div
            className={cn(
              "relative rounded-xl p-6 transition-all duration-200 border border-white/[0.06]",
              isDragActive && "border-white/20",
            )}
            style={{
              backdropFilter: "blur(20px) saturate(130%)",
              WebkitBackdropFilter: "blur(20px) saturate(130%)",
              background: `linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.4) 0%,
                rgba(0, 0, 0, 0.3) 50%,
                rgba(0, 0, 0, 0.35) 100%
              )`,
              boxShadow: `
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.03),
                inset 0 -1px 2px 0 rgba(0, 0, 0, 0.1),
                0 4px 16px rgba(0, 0, 0, 0.15)
              `,
            }}
          >
            {files.length > 0 ? (
              /* File preview */
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <motion.div
                    key={"file" + idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08]"
                    style={{
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      background: "rgba(255, 255, 255, 0.05)",
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.1]"
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <ImageIcon className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-white/40 font-medium">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={(e) => handleRemoveFile(e, idx)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.1] hover:border-red-500/30 hover:bg-red-500/20 transition-colors"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center py-4">
                {/* Button row */}
                <div className="flex items-center gap-3">
                  {/* Browse files button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-wide text-white transition-all overflow-hidden border border-white/[0.15]"
                    style={{
                      backdropFilter: "blur(24px) saturate(150%)",
                      WebkitBackdropFilter: "blur(24px) saturate(150%)",
                      background: `linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.12) 0%,
                        rgba(255, 255, 255, 0.06) 50%,
                        rgba(255, 255, 255, 0.08) 100%
                      )`,
                      boxShadow: `
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
                        inset 0 -1px 0 0 rgba(0, 0, 0, 0.1),
                        0 4px 24px rgba(0, 0, 0, 0.2)
                      `,
                    }}
                  >
                    <FolderOpen className="w-4 h-4" strokeWidth={2} />
                    {isDragActive ? "DROP HERE" : "BROWSE FILES"}
                  </motion.button>

                  <span className="text-white/30 text-xs font-medium">or</span>

                  {/* Camera capture button */}
                  <motion.button
                    type="button"
                    onClick={handleCameraClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-wide text-white transition-all overflow-hidden border border-white/[0.15]"
                    style={{
                      backdropFilter: "blur(24px) saturate(150%)",
                      WebkitBackdropFilter: "blur(24px) saturate(150%)",
                      background: `linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.12) 0%,
                        rgba(255, 255, 255, 0.06) 50%,
                        rgba(255, 255, 255, 0.08) 100%
                      )`,
                      boxShadow: `
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
                        inset 0 -1px 0 0 rgba(0, 0, 0, 0.1),
                        0 4px 24px rgba(0, 0, 0, 0.2)
                      `,
                    }}
                  >
                    <Camera className="w-4 h-4" strokeWidth={2} />
                    TAKE PHOTO
                  </motion.button>
                </div>
                <p className="text-xs text-white/35 mt-4 font-medium">
                  JPG, JPEG, PNG only allowed. Up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
