"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Parse item links in assistant messages: /items/123 → clickable links
function parseMessageContent(content: string) {
  // Match markdown-style links [text](/path) or plain /items/ID patterns
  const parts = content.split(/(\[.*?\]\(\/items\/\d+\)|\/items\/\d+)/g);

  return parts.map((part, i) => {
    // Markdown link: [text](/items/123)
    const mdMatch = part.match(/\[(.*?)\]\((\/items\/\d+)\)/);
    if (mdMatch) {
      return (
        <Link
          key={i}
          href={mdMatch[2]}
          className="text-primary-400 hover:text-primary-300 underline underline-offset-2 font-semibold transition-colors"
        >
          {mdMatch[1]}
        </Link>
      );
    }

    // Plain link: /items/123
    const plainMatch = part.match(/^\/items\/(\d+)$/);
    if (plainMatch) {
      return (
        <Link
          key={i}
          href={part}
          className="text-primary-400 hover:text-primary-300 underline underline-offset-2 font-semibold transition-colors"
        >
          View Item #{plainMatch[1]}
        </Link>
      );
    }

    // Bold: **text**
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    if (boldParts.length > 1) {
      return boldParts.map((bp, j) => {
        const boldMatch = bp.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
          return (
            <strong key={`${i}-${j}`} className="font-bold text-white">
              {boldMatch[1]}
            </strong>
          );
        }
        return bp;
      });
    }

    return part;
  });
}

const SUGGESTED_PROMPTS = [
  "I lost my water bottle",
  "How do I report a found item?",
  "What happens after 30 days?",
  "How do points work?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
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
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessages([
            ...newMessages,
            { role: "assistant", content: data.message },
          ]);
        } else {
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: "Sorry, something went wrong. Please try again!",
            },
          ]);
        }
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Couldn't connect to the server. Please check your connection and try again.",
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
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:bg-primary-400 transition-colors"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6" />
            {/* Pulse ring */}
            {!hasInteracted && (
              <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-30" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[540px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,30,30,0.98) 0%, rgba(20,20,20,0.99) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-primary-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Reclaimr Assistant
                  </h3>
                  <p className="text-[11px] text-white/40">
                    AI-powered help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary-400" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-white/80 leading-relaxed">
                        Hey! I&apos;m the Reclaimr Assistant. I can help you find lost items or answer questions about the platform. What can I help with?
                      </p>
                    </div>
                  </div>

                  {/* Suggested prompts */}
                  <div className="pl-9 space-y-2">
                    <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      Try asking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === "user"
                        ? "bg-white/10"
                        : "bg-primary-500/20"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-white/60" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-primary-400" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-primary-500/20 border border-primary-500/20 rounded-tr-md"
                        : "bg-white/5 rounded-tl-md"
                    }`}
                  >
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                      {msg.role === "assistant"
                        ? parseMessageContent(msg.content)
                        : msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                      <span className="text-xs text-white/40">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/8">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2 focus-within:border-primary-500/40 transition-colors">
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
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:hover:bg-primary-500 transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-2">
                Powered by AI · Searches real lost & found data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
