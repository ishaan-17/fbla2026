"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Search, Bell, ArrowRight, Sparkles, MapPin, Calendar } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Suspense, useState, useEffect } from "react";

interface FoundItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
  location_found: string;
  date_found: string;
  reporter_name: string;
  reporter_email: string;
}

interface Match {
  id: number;
  total_score: number;
  image_similarity: number;
  text_similarity: number;
  category_match: boolean;
  found_item_id: number;
  items: FoundItem;
}

function LostItemSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const matchesParam = searchParams.get("matches");
    if (matchesParam) {
      try {
        const parsedMatches = JSON.parse(matchesParam);
        setMatches(parsedMatches);
      } catch (e) {
        console.error("Failed to parse matches:", e);
      }
    }
  }, [searchParams]);

  const hasMatches = matches.length > 0;

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.7) return { label: "High", color: "text-green-400", bg: "bg-green-500/20" };
    if (score >= 0.5) return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    return { label: "Low", color: "text-blue-400", bg: "bg-blue-500/20" };
  };

  return (
    <div className="min-h-screen bg-[#121212] -mt-16 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Report Submitted!
            </h1>
            
            {hasMatches ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 mb-4"
              >
                <Sparkles className="w-5 h-5 text-primary-400" />
                <span className="text-lg font-semibold text-primary-400">
                  We found {matches.length} potential match{matches.length > 1 ? 'es' : ''}!
                </span>
              </motion.div>
            ) : (
              <p className="text-lg text-white/60 mb-8 max-w-md mx-auto">
                We&apos;ve received your lost item report. We&apos;ll notify you if we find any matches.
              </p>
            )}
          </div>

          {/* Matches Section */}
          {hasMatches ? (
            <div className="mb-12">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 text-center">
                Potential Matches
              </h2>
              
              <div className="space-y-6">
                {matches.map((match, index) => {
                  const confidence = getConfidenceLevel(match.total_score);
                  const imageUrl = match.items.image_path
                    ? match.items.image_path.startsWith("http")
                      ? match.items.image_path
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${match.items.image_path}`
                    : null;

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/8 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image */}
                          {imageUrl ? (
                            <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                              <Image
                                src={imageUrl}
                                alt={match.items.title}
                                width={192}
                                height={192}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-full sm:w-48 h-48 rounded-xl flex-shrink-0 bg-white/5 flex items-center justify-center">
                              <span className="text-6xl">📦</span>
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <h3 className="text-xl font-bold text-white">{match.items.title}</h3>
                              <div className={`px-3 py-1 rounded-full ${confidence.bg} flex-shrink-0`}>
                                <span className={`text-sm font-semibold ${confidence.color}`}>
                                  {Math.round(match.total_score * 100)}% Match
                                </span>
                              </div>
                            </div>

                            <p className="text-white/70 mb-4 line-clamp-2">{match.items.description}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <MapPin className="w-4 h-4" />
                                <span>{match.items.location_found}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(match.items.date_found).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/70 capitalize">
                                {match.items.category}
                              </span>
                              {match.category_match && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                                  Category Match
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link href={`/items/${match.items.id}`}>
                                <LiquidButton size="sm" variant="light">
                                  View Details
                                </LiquidButton>
                              </Link>
                              <a href={`mailto:${match.items.reporter_email}`}>
                                <LiquidButton size="sm" variant="light">
                                  Contact Finder
                                </LiquidButton>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
              >
                <p className="text-sm text-blue-300 text-center">
                  💡 These matches are based on AI analysis. Please review each one carefully and contact the finder if you think it&apos;s your item.
                </p>
              </motion.div>
            </div>
          ) : (
            /* What Happens Next - shown when no matches */
            <div className="text-left mb-12 max-w-2xl mx-auto">
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
                    <h3 className="font-semibold text-white mb-1">Continuous Monitoring</h3>
                    <p className="text-sm text-white/50">
                      Our system continuously monitors new found items as they&apos;re reported.
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
                      If we find a match in the future, we&apos;ll notify you immediately.
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
                    <h3 className="font-semibold text-white mb-1">Browse Manually</h3>
                    <p className="text-sm text-white/50">
                      You can also browse all found items manually to check for your item.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/items">
              <LiquidButton>
                Browse All Found Items
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

export default function LostItemSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LostItemSuccessContent />
    </Suspense>
  );
}
