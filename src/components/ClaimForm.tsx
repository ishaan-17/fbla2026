"use client";

import { useState } from "react";

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
        <div className="w-12 h-12 bg-earth-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-earth-900 mb-2">Claim Submitted!</h3>
        <p className="text-sm text-earth-500">
          Your claim has been submitted successfully. An admin will review it and get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-sm font-bold text-earth-900 uppercase tracking-wider">
        Claim This Item
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-earth-700 mb-1.5">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-earth-700 mb-1.5">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
          placeholder="your.email@school.edu"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-earth-700 mb-1.5">
          Why do you believe this is yours?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors resize-none"
          placeholder="Describe the item in detail — color, brand, distinguishing features, when/where you lost it..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 bg-earth-900 text-white text-sm font-bold tracking-wide hover:bg-earth-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Claim"
        )}
      </button>
    </form>
  );
}
