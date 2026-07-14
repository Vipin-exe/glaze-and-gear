"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[500px] flex flex-col items-center">
      <input 
        type="email" 
        required
        placeholder="YOUR EMAIL ADDRESS" 
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-4 md:p-6 border-b-2 border-[#98202E] font-sans text-sm md:text-base text-center outline-none bg-transparent placeholder:text-[#98202E]/50" 
        disabled={status === "loading"}
      />
      <button 
        type="submit" 
        disabled={status === "loading" || !email}
        className="mt-6 px-8 py-3 bg-[#98202E] text-white font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-[#7a1a25] disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      
      {message && (
        <p className={`mt-4 text-sm font-bold tracking-widest uppercase ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
