"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
      setIsInitializing(false);
    }
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
        <div className="animate-pulse w-12 h-12 border-4 border-[#98202E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md text-center border border-red-100">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-500 mb-6">
            This password reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            className="bg-[#98202E] text-white px-6 py-3 rounded-xl font-bold inline-block"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset!
          </h1>
          <p className="text-gray-500 mb-6">{message}</p>
          <p className="text-sm text-gray-400">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4">
        <h1 className="text-3xl font-serif font-black text-center text-[#98202E] mb-2 uppercase tracking-widest">
          New Password
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Create a strong new password.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            required
            minLength={6}
            placeholder="New Password (min 6 chars)"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full mt-4 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
