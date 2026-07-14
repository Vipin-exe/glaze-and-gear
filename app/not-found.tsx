import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#98202E] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-[8rem] font-black font-serif leading-none tracking-tighter mb-4 text-[#98202E]/20">404</h1>
        <h2 className="text-3xl font-bold mb-4 font-serif">Page Not Found</h2>
        <p className="mb-8 opacity-70 text-sm md:text-base">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="px-10 py-4 bg-[#98202E] text-white font-bold text-sm uppercase tracking-widest rounded-full transition-transform hover:-translate-y-1 shadow-lg inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
