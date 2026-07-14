"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-[#98202E] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-6xl font-black font-serif mb-6 tracking-tight">Oops!</h1>
        <h2 className="text-2xl font-bold mb-4 opacity-80">Something went wrong</h2>
        <p className="mb-8 opacity-60 text-sm md:text-base">
          We encountered an unexpected issue while loading this page. Our team has been notified. 
          In the meantime, you can try reloading or head back to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-[#98202E] text-white font-bold text-sm uppercase tracking-widest rounded-full transition-transform hover:-translate-y-1 shadow-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-3 bg-transparent border-2 border-[#98202E] text-[#98202E] font-bold text-sm uppercase tracking-widest rounded-full transition-transform hover:-translate-y-1"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
