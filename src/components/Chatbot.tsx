"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  BotMessageSquare,
  MapPin,
  CalendarDays,
  Tag,
  ExternalLink,
  FileText,
  Search,
  Trophy,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────────────

interface MatchedItem {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  location_found: string;
  date_found: string;
  tags: string;
  image_url?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  items?: MatchedItem[];
}

// ── Page link metadata ───────────────────────────────────────────────

interface PageLinkInfo {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PAGE_LINK_MAP: Record<string, Omit<PageLinkInfo, "href" | "label">> = {
  "/report": {
    description: "Report a found or lost item",
    icon: FileText,
  },
  "/items": {
    description: "Search and browse all found items",
    icon: Search,
  },
  "/leaderboard": {
    description: "See top contributors and points",
    icon: Trophy,
  },
  "/about": {
    description: "Learn about the Reclaimr platform",
    icon: Info,
  },
};

// ── Page Link Embed Card ─────────────────────────────────────────────

function PageLinkCard({ link }: { link: PageLinkInfo }) {
  const Icon = link.icon;
  return (
    <Link href={link.href}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 rounded-xl overflow-hidden cursor-pointer group transition-all"
        style={{
          background: "rgba(36,59,83,0.35)",
          border: "1px solid rgba(98,125,152,0.2)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(98,125,152,0.2)",
            }}
          >
            <Icon className="w-4 h-4 text-primary-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">
              {link.label}
            </p>
            <p className="text-xs text-white/40 truncate">{link.description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
        </div>
      </motion.div>
    </Link>
  );
}

// ── Inline text parser (bold, links) ─────────────────────────────────

interface ParsedMessage {
  content: ReactNode[];
  pageLinks: PageLinkInfo[];
}

function parseMessageContent(text: string): ParsedMessage {
  const pageLinks: PageLinkInfo[] = [];

  // Extract page links from the text and collect them for embed cards
  // Match markdown links: [Link Text](/path)
  const linkPattern = /\[([^\]]+)\]\((\/[a-z-]+(?:\/\d+)?)\)/g;
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    const href = match[2];
    const label = match[1];
    const pageMeta = PAGE_LINK_MAP[href];
    if (pageMeta) {
      // It's a known page — add as embed card, remove from text
      pageLinks.push({ href, label, ...pageMeta });
    }
  }

  // Remove page links from the text (they'll be rendered as cards below)
  let cleanedText = text;
  for (const link of pageLinks) {
    // Remove all markdown link instances for this page
    const escaped = link.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleanedText = cleanedText.replace(
      new RegExp(`\\[[^\\]]+\\]\\(${escaped}\\)`, "g"),
      ""
    );
  }
  // Clean up leftover awkward spacing
  cleanedText = cleanedText.replace(/\s{2,}/g, " ").trim();

  // Now parse the remaining text for item links, bold, etc.
  const parts = cleanedText.split(
    /(\[.*?\]\(\/items\/\d+\)|\/items\/\d+|\*\*.*?\*\*)/g
  );

  const content = parts
    .map((part, i) => {
      if (!part) return null;

      const mdMatch = part.match(/\[(.*?)\]\((\/items\/\d+)\)/);
      if (mdMatch) {
        return (
          <Link
            key={i}
            href={mdMatch[2]}
            className="text-blue-300 hover:text-blue-200 underline underline-offset-2 font-semibold transition-colors"
          >
            {mdMatch[1]}
          </Link>
        );
      }

      const plainMatch = part.match(/^\/items\/(\d+)$/);
      if (plainMatch) {
        return (
          <Link
            key={i}
            href={part}
            className="text-blue-300 hover:text-blue-200 underline underline-offset-2 font-semibold transition-colors"
          >
            View Item #{plainMatch[1]}
          </Link>
        );
      }

      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={i} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
      }

      return part;
    })
    .filter(Boolean);

  return { content, pageLinks };
}

// ── Category emoji mapper ────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    electronics: "📱",
    clothing: "👕",
    bags: "🎒",
    water_bottles: "🧴",
    books: "📚",
    keys: "🔑",
    accessories: "💍",
    sports: "⚽",
    food_containers: "🍱",
    stationery: "✏️",
    umbrellas: "☂️",
    headphones: "🎧",
    glasses: "👓",
    jewelry: "💎",
    wallets: "👛",
  };
  return map[category] || "📦";
}

// ── Item Card Component ──────────────────────────────────────────────

function ItemCard({ item }: { item: MatchedItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-2.5 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="p-3.5">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-3">
          {item.image_url ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.15)",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.1)",
              }}
            >
              <span className="text-xl">{getCategoryEmoji(item.category)}</span>
            </div>
          )}
          <h4 className="text-sm font-bold text-white leading-tight">
            {item.title}
          </h4>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/60 mb-2.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-white/40" />
            {item.location_found}
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-white/40" />
            Date: {item.date_found}
          </span>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-white/50 mb-3">
            <Tag className="w-3 h-3 text-white/40" />
            {item.tags}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/items/${item.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-earth-900 transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          That&apos;s mine! View Details
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Constants ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "I lost my water bottle",
  "How do I report a found item?",
  "What happens after 30 days?",
  "How do points work?",
];

// ── Main Component ───────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || input.trim();
      if (!text || isLoading) return;

      setHasInteracted(true);
      const userMessage: Message = { role: "user", content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const data = await res.json();

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: res.ok
              ? data.message
              : "Sorry, something went wrong. Please try again!",
            items: res.ok ? data.items : undefined,
          },
        ]);
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Couldn't connect to the server. Please check your connection.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: "rgba(30,40,60,0.7)",
              backdropFilter: "blur(20px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.3), 0 12px 48px rgba(0,0,0,0.2)",
            }}
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-5 h-5 text-white/90" />
            {!hasInteracted && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-15 border border-white/30" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-h-[85vh] flex flex-col overflow-hidden"
            style={{
              borderRadius: "20px",
              background: "rgba(30, 35, 45, 0.55)",
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.35), 0 24px 80px rgba(0,0,0,0.25), inset 0 1px 0 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <BotMessageSquare className="w-5 h-5 text-white/80" />
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                    style={{
                      background: "#22c55e",
                      border: "2.5px solid rgba(30,35,45,0.9)",
                      boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                    }}
                  />
                </div>
                <h3 className="text-[15px] font-bold text-white leading-tight">
                  Reclaimr Assistant
                </h3>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white/50" />
              </motion.button>
            </div>

            {/* ── Messages ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="space-y-4"
                >
                  <div
                    className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[88%]"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="text-sm text-white/80 leading-relaxed">
                      Hey! I&apos;m the Reclaimr Assistant. I can help you find
                      lost items or answer questions about the platform. What can
                      I help with?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      Try asking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.1 + idx * 0.05,
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => sendMessage(prompt)}
                          className="text-xs px-3 py-1.5 rounded-full text-white/60 cursor-pointer transition-colors hover:text-white/80 hover:bg-white/10"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex justify-end"
                    >
                      <div
                        className="rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]"
                        style={{
                          background:
                            "linear-gradient(135deg, #1e3a5f 0%, #1a2d4a 100%)",
                          border: "1px solid rgba(100,150,220,0.15)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        <p className="text-sm text-white leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  );
                }

                // Assistant message with optional item cards
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="max-w-[88%]"
                  >
                    {/* Text bubble */}
                    {(() => {
                      const parsed = parseMessageContent(msg.content);
                      return (
                        <>
                          {/* Text bubble */}
                          {parsed.content.length > 0 && (
                            <div
                              className="rounded-2xl rounded-bl-md px-4 py-3"
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                                {parsed.content}
                              </p>
                            </div>
                          )}

                          {/* Page link embed cards */}
                          {parsed.pageLinks.map((link, j) => (
                            <PageLinkCard key={`link-${j}`} link={link} />
                          ))}

                          {/* Item cards from structured API data */}
                          {msg.items &&
                            msg.items.map((item) => (
                              <ItemCard key={item.id} item={item} />
                            ))}
                        </>
                      );
                    })()}
                  </motion.div>
                );
              })}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-white/50 animate-spin" />
                      <span className="text-xs text-white/40">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ───────────────────────────────────────── */}
            <div
              className="px-3 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you lost..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 cursor-pointer transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, rgba(100,180,255,0.3) 0%, rgba(80,140,220,0.2) 100%)"
                      : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 text-white/80" />
                </motion.button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-2 tracking-wide">
                Powered by AI · Searches real lost &amp; found data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
