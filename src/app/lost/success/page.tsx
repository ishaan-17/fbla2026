"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Search, Bell, ArrowRight } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function LostItemSuccessPage() {
  return (
    <div className="min-h-screen bg-[#121212] -mt-16 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-8"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Report Submitted!
          </h1>
          
          <p className="text-lg text-white/60 mb-12 max-w-md mx-auto">
            We&apos;ve received your lost item report. Our system is now searching for potential matches.
          </p>

          {/* What Happens Next */}
          <div className="text-left mb-12">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 text-center">
              What happens next?
            </h2>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Automatic Matching</h3>
                  <p className="text-sm text-white/50">
                    Our AI compares your description and image with all found items in our system.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Get Notified</h3>
                  <p className="text-sm text-white/50">
                    If we find a potential match, you&apos;ll receive a notification with details about the found item.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Claim Your Item</h3>
                  <p className="text-sm text-white/50">
                    Review the match and claim your item. You can also browse all found items yourself.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/items">
              <LiquidButton>
                Browse Found Items
              </LiquidButton>
            </Link>
            <Link href="/">
              <LiquidButton variant="light">
                Back to Home
              </LiquidButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
