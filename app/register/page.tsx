"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
    } else {
      setSuccessMessage(data.message);
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 pt-[160px] pb-20 md:py-20">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h1>
          <p className="text-gray-500 mb-6">{successMessage}</p>
          <p className="text-sm text-gray-400 font-medium italic">(For this demo, check your terminal console for the verification link!)</p>
          <Link href="/login" className="inline-block mt-8 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9EAEA]/30 px-4 pt-[160px] pb-20 md:py-20">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 w-full max-w-md animate-in slide-in-from-bottom-4">
        <h1 className="text-3xl font-serif font-black text-center text-[#98202E] mb-2 uppercase tracking-widest">Create Account</h1>
        <p className="text-center text-gray-500 mb-8 font-medium">Join Glaze & Gear today.</p>

        <button 
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm mb-6"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">or sign up with email</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input 
            type="text" 
            required 
            placeholder="Full Name" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input 
            type="email" 
            required 
            placeholder="Email Address" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            required 
            minLength={6}
            placeholder="Password (min 6 characters)" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full mt-4 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8 font-medium">
          Already have an account? <Link href="/login" className="text-[#98202E] font-bold hover:underline transition-all">Log In</Link>
        </p>
      </div>
    </div>
  );
}
