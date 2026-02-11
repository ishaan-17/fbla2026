"use client";

import { useState, useEffect } from "react";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    fetch("/api/items?all=true&limit=1")
      .then(async () => {
        const adminCheck = await fetch("/api/claims");
        if (adminCheck.ok) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Invalid password");
        return;
      }

      setAuthenticated(true);
    } catch {
      setError("Something went wrong");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPassword("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-earth-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-24 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-earth-900 tracking-tight">Admin Access</h2>
          <p className="text-earth-500 text-sm mt-2">Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-800 text-center">
              {error}
            </div>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3.5 bg-white border border-earth-300 text-sm text-earth-900 placeholder:text-earth-400 focus:border-earth-900 focus:outline-none transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-earth-900 text-white text-sm font-bold tracking-wide hover:bg-earth-800 transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-earth-400 hover:text-earth-900 transition-colors"
        >
          Log Out
        </button>
      </div>
      {children}
    </div>
  );
}
