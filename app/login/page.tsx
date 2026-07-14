"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUrlError(params.get("error") || "");
    }
  }, []);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 pt-[160px] pb-20 md:py-20">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4">
        <h1 className="text-3xl font-serif font-black text-center text-[#98202E] mb-2 uppercase tracking-widest">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Log in to your Glaze & Gear account
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm mb-6"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            or continue with email
          </span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {(error || urlError) && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold text-center mb-6">
            {error || "An authentication error occurred. Please try again."}
          </div>
        )}

        <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email Address"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right mt-3">
              <Link
                href="/forgot-password"
                className="text-sm text-[#98202E] font-bold hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            disabled={loading}
            className="w-full mt-4 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8 font-medium">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-[#98202E] font-bold hover:underline transition-all"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
