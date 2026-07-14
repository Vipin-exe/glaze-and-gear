"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWishlist(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status]);

  const handleAddToCart = async (product: any) => {
    setAddingToCart(product.id);
    setMessage(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setMessage({ text: `${product.name} added to cart!`, type: 'success' });
        // Optionally trigger cart update event if you have a global cart state
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const errorData = await res.json();
        setMessage({ text: errorData.error || "Failed to add to cart.", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong.", type: 'error' });
    } finally {
      setAddingToCart(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (status === "loading" || loading) {
    return <div className="pt-[150px] text-center min-h-screen text-[#98202E]">Loading wishlist...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="pt-[150px] min-h-screen bg-[#F9EAEA]/30 px-[5%]">
        <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-[#98202E]/10">
          <h2 className="text-3xl font-serif text-[#98202E] mb-6">Please login to view your wishlist.</h2>
          <Link href="/login" className="inline-block bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-xl shadow-[#98202E]/20">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[160px] md:pt-[100px] min-h-screen bg-[#F9EAEA]/30">
      <div className="max-w-7xl mx-auto px-[5%] py-12 relative">
        {/* Toast Message */}
        {message && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white font-bold text-sm tracking-widest uppercase shadow-xl animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <h1 className="text-4xl font-serif font-black text-[#98202E] tracking-widest uppercase mb-12 border-b border-[#98202E]/20 pb-4">
          Your Wishlist ❤️
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-[#98202E]/10">
            <h2 className="text-2xl font-serif text-gray-400 italic mb-6">Your wishlist is currently empty.</h2>
            <Link href="/" className="inline-block bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-xl shadow-[#98202E]/20">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {wishlist.map((item, index) => (
              <div key={item.id || index} className="flex flex-col gap-4">
                <div className="flex-1">
                  <ProductCard product={item.product} />
                </div>
                <button
                  onClick={() => handleAddToCart(item.product)}
                  disabled={item.product.stock === 0 || addingToCart === item.product.id}
                  className="w-full bg-[#98202E] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#7a1a25] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {addingToCart === item.product.id 
                    ? "Adding..." 
                    : item.product.stock === 0 
                      ? "Out of Stock" 
                      : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
