"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ product }: { product: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use WishlistContext instead of local state/fetching
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.slug || product.id}`} className={`no-underline block h-full ${isOutOfStock ? "opacity-75" : ""}`}>
      <div className="bg-white border border-[#98202E]/10 p-3 sm:p-6 rounded-[16px] sm:rounded-[20px] transition-all duration-500 hover:-translate-y-[10px] hover:shadow-[0_30px_60px_rgba(152,32,46,0.15)] cursor-pointer text-left relative h-full flex flex-col group">
        
        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] group/btn"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={inWishlist ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth={inWishlist ? "0" : "2"} 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${inWishlist ? "text-[#98202E] scale-110" : "text-gray-400 group-hover/btn:text-[#98202E] group-hover/btn:scale-110"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div className="w-full aspect-square rounded-lg sm:rounded-xl mb-3 sm:mb-6 overflow-hidden relative">
          <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-all duration-700 ${isOutOfStock ? "grayscale-[50%]" : "group-hover:scale-110"}`} />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-[#98202E] text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-4 py-1 sm:py-2 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70 mb-1 sm:mb-2 text-[#98202E]">{product.category}</p>
          <h3 className="text-sm sm:text-2xl font-serif text-[#98202E] mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[4rem] leading-tight">{product.name}</h3>
          <p className="font-bold text-[#D09399] text-base sm:text-xl mb-2 sm:mb-4 mt-auto">₹{product.price?.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
