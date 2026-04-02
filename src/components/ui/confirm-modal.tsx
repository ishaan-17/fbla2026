"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { LiquidButton } from "./liquid-glass-button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: "bg-red-500/20",
      iconColor: "text-red-400",
      accentColor: "text-red-400",
    },
    warning: {
      icon: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      accentColor: "text-yellow-400",
    },
    info: {
      icon: "bg-blue-500/20",
      iconColor: "text-blue-400",
      accentColor: "text-blue-400",
    },
  };

  const style = variantStyles[variant];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Liquid Glass Container */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Glass Background Layers */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    backdropFilter: "blur(24px) saturate(150%)",
                    WebkitBackdropFilter: "blur(24px) saturate(150%)",
                    background: `linear-gradient(
                      135deg,
                      rgba(255, 255, 255, 0.15) 0%,
                      rgba(255, 255, 255, 0.08) 50%,
                      rgba(255, 255, 255, 0.12) 100%
                    )`,
                  }}
                />

                {/* Border */}
                <div
                  className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: `
                      inset 0 0 0 1px rgba(255, 255, 255, 0.15),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
                      inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)
                    `,
                  }}
                />

                {/* Outer Shadow */}
                <div
                  className="absolute inset-0 z-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(0, 0, 0, 0.2)",
                  }}
                />

                {/* Content */}
                <div className="relative z-20 p-6">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white/70" />
                  </button>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full ${style.icon} flex items-center justify-center`}>
                      <AlertTriangle className={`w-8 h-8 ${style.iconColor}`} />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className={`text-xl font-bold text-white text-center mb-2 ${style.accentColor}`}>
                    {title}
                  </h2>

                  {/* Message */}
                  <p className="text-white/70 text-center mb-6">
                    {message}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <LiquidButton
                      variant="light"
                      size="lg"
                      onClick={onClose}
                      className="flex-1"
                    >
                      {cancelText}
                    </LiquidButton>
                    <LiquidButton
                      variant="dark"
                      size="lg"
                      onClick={handleConfirm}
                      className="flex-1"
                    >
                      {confirmText}
                    </LiquidButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render to document.body using portal when mounted
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
