"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // NextAuth Session
  const { data: session } = useSession();

  // This hook tells the Navbar exactly which page it is currently on
  const pathname = usePathname();
  const isGearsPage = pathname === "/gears";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      if (session?.user) {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            fetch('/api/cart'),
            fetch('/api/wishlist')
          ]);
          if (cartRes.ok) {
            const cart = await cartRes.json();
            const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
            setCartCount(totalItems);
          }
          if (wishlistRes.ok) {
            const wishlist = await wishlistRes.json();
            setWishlistCount(wishlist.length);
          }
        } catch (error) {
          console.error("Failed to fetch counts", error);
        }
      } else {
        setCartCount(0);
        setWishlistCount(0);
      }
    };

    fetchCounts();
    window.addEventListener("cartUpdated", fetchCounts);
    window.addEventListener("wishlistUpdated", fetchCounts);

    return () => {
      window.removeEventListener("cartUpdated", fetchCounts);
      window.removeEventListener("wishlistUpdated", fetchCounts);
    };
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
      setSearchQuery("");
    }
  };

  // --- DYNAMIC STYLING LOGIC ---
  const headerClasses = isGearsPage
    ? (scrolled || menuOpen ? "px-[5%] py-4 bg-white text-black shadow-md" : "px-[5%] py-6 bg-[#0a0a0a] text-white")
    : (scrolled || menuOpen ? "px-[5%] py-3 bg-[#98202E] text-[#F9EAEA] shadow-md" : "px-[5%] py-6 bg-[#F9EAEA]/80 backdrop-blur-md border-b border-[#98202E]/10 text-[#98202E]");

  const logoClasses = isGearsPage
    ? "invert"
    : (scrolled || menuOpen ? "brightness-0 invert" : "");

  const cartBadgeClasses = isGearsPage
    ? (scrolled || menuOpen ? "bg-black text-white" : "bg-white text-black")
    : (scrolled || menuOpen ? "bg-white text-[#98202E]" : "bg-[#98202E] text-white");

  const hamburgerClasses = isGearsPage
    ? (scrolled || menuOpen ? "bg-black" : "bg-white")
    : (scrolled || menuOpen ? "bg-white" : "bg-[#98202E]");

  const mobileMenuClasses = isGearsPage ? "bg-[#0a0a0a]" : "bg-[#98202E]";

  return (
    <>
      <header className={`fixed top-0 w-full flex flex-col z-[2000] transition-all duration-500 ${headerClasses}`}>
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-3 z-[2001] no-underline">
            <img
              src="/g_g_logo_bg-removebg-preview.png"
              alt="Glaze & Gear Logo"
              className={`w-[45px] h-[45px] object-contain drop-shadow-sm transition-all duration-500 ${logoClasses}`}
            />
            <div className="text-xl font-extrabold tracking-tight uppercase">
              Glaze & Gear
            </div>
          </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/#shop" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Glaze</Link>
          <Link href="/gears" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Gears</Link>
          <Link href="/products" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">All Products</Link>
          <Link href="/about" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">About</Link>
          
          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="relative flex items-center ml-2">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-4 pr-8 py-1.5 w-[160px] lg:w-[200px] rounded-full border text-sm outline-none transition-all ${
                isGearsPage 
                  ? (scrolled || menuOpen ? "border-gray-300 bg-gray-100 text-black focus:border-black" : "border-gray-700 bg-black/50 text-white focus:border-white")
                  : (scrolled || menuOpen ? "border-white/30 bg-white/20 text-current placeholder-current focus:border-white" : "border-[#98202E]/30 bg-white/50 text-[#98202E] placeholder-[#98202E]/70 focus:border-[#98202E]")
              }`}
            />
            <button type="submit" className="absolute right-2.5 opacity-70 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </button>
          </form>

          <div className="w-px h-6 bg-current opacity-20 mx-2"></div>
          
          {session ? (
            <>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="font-black text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Dashboard</Link>
              )}
              <Link href="/account/settings" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Account</Link>
              <Link href="/account/orders" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">My Orders</Link>
              <button onClick={() => signOut()} className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Logout</button>
            </>
          ) : (
            <Link href="/login" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Login</Link>
          )}

          <Link href="/wishlist" className="flex items-center p-2 rounded-full transition-all hover:bg-black/5 hover:scale-105 relative ml-2 group" aria-label="Wishlist">
            <svg className="w-5 h-5 fill-current group-hover:text-red-500 transition-colors" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-colors ${cartBadgeClasses}`}>
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="flex items-center p-2 rounded-full transition-all hover:bg-black/5 hover:scale-105 relative group" aria-label="Cart">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-colors ${cartBadgeClasses}`}>
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

          {/* Mobile Hamburger Icon */}
          <div
            className="lg:hidden flex flex-col gap-[6px] cursor-pointer z-[2002] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "translate-y-[8px] rotate-45" : ""}`} />
            <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "-translate-y-[8px] -rotate-45" : ""}`} />
          </div>
        </div>

        {/* Mobile Search Bar - Under the Navbar */}
        <div className="w-full lg:hidden mt-3">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-4 pr-10 py-2 rounded-full border text-sm outline-none transition-all shadow-sm ${
                isGearsPage 
                  ? (scrolled || menuOpen ? "border-gray-300 bg-gray-100 text-black focus:border-black" : "border-gray-700 bg-black/50 text-white focus:border-white")
                  : (scrolled || menuOpen ? "border-white/30 bg-white/20 text-current placeholder-current focus:border-white" : "border-[#98202E]/30 bg-white/50 text-[#98202E] placeholder-[#98202E]/70 focus:border-[#98202E]")
              }`}
            />
            <button type="submit" className="absolute right-3 opacity-70 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <nav
        className={`fixed top-0 w-full h-screen flex flex-col justify-center items-center gap-6 transition-all duration-500 z-[1500] ${mobileMenuClasses} ${menuOpen ? "right-0" : "-right-full"} overflow-y-auto pb-10 pt-[160px]`}
      >
        <Link href="/#shop" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Glaze</Link>
        <Link href="/gears" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Gears</Link>
        <Link href="/products" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">All Products</Link>
        
        {session ? (
          <>
            {session.user?.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-black tracking-widest hover:scale-110 hover:opacity-70 transition-all">Dashboard</Link>
            )}
            <Link href="/account/settings" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Account</Link>
            <Link href="/account/orders" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">My Orders</Link>
            <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Logout</button>
          </>
        ) : (
          <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Login</Link>
        )}
        
        <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all mt-8 flex items-center gap-3">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> 
          Wishlist ({wishlistCount})
        </Link>
        <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all flex items-center gap-3">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg> 
          Cart ({cartCount})
        </Link>
      </nav>
    </>
  );
}