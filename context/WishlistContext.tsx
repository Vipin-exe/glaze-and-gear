"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type WishlistContextType = {
  wishlistIds: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const fetchWishlist = async () => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlistIds(data.map((item: any) => item.productId));
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [status]);

  const addToWishlist = async (productId: string) => {
    // Optimistic update
    setWishlistIds(prev => [...prev, productId]);
    
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      // Fire event so WishlistPage can re-fetch full products if needed
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      // Revert on failure
      setWishlistIds(prev => prev.filter(id => id !== productId));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    // Optimistic update
    setWishlistIds(prev => prev.filter(id => id !== productId));

    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      // Revert on failure
      setWishlistIds(prev => [...prev, productId]);
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, isInWishlist, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
