"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token, isInitializing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-[#98202E] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-xl font-bold text-gray-900">{message}</h1>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✓
            </div>
            <h1 className="text-2xl font-serif font-black text-gray-900 mb-4 tracking-wide">
              {message}
            </h1>
            <p className="text-gray-500 mb-8">You can now access your account.</p>
            <Link
              href="/login"
              className="bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-lg shadow-[#98202E]/20 inline-block w-full"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✗
            </div>
            <h1 className="text-2xl font-serif font-black text-gray-900 mb-4 tracking-wide">
              Verification Failed
            </h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <Link
              href="/login"
              className="text-[#98202E] font-bold hover:underline transition-all"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
