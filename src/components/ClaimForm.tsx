"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function ClaimForm({ itemId }: { itemId: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          claimant_name: name,
          claimant_email: email,
          claimant_description: description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit claim");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Claim Submitted!</h3>
        <p className="text-sm text-white/60">
          Your claim has been submitted successfully. An admin will review it and get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Claim This Item
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
          placeholder="your.email@school.edu"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          Why do you believe this is yours?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30 resize-none"
          placeholder="Describe the item in detail — color, brand, distinguishing features, when/where you lost it..."
        />
      </div>

      <LiquidButton
        type="submit"
        disabled={submitting}
        variant="light"
        size="full"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Claim"
        )}
      </LiquidButton>
    </form>
  );
}
