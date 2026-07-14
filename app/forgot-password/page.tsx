"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4">
        <h1 className="text-3xl font-serif font-black text-center text-[#98202E] mb-2 uppercase tracking-widest">Reset Password</h1>
        <p className="text-center text-gray-500 mb-8 font-medium">Enter your email to receive a reset link.</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        {message ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
            <p className="font-bold mb-4">{message}</p>
            <p className="text-sm">Please check your inbox (and spam folder).</p>
            <Link href="/login" className="inline-block mt-6 text-[#98202E] font-bold hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="email" 
              required 
              placeholder="Email Address" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            
            <button 
              disabled={loading}
              className="w-full mt-4 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-gray-500 font-bold hover:text-[#98202E] transition-colors">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
