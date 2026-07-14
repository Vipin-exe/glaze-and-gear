"use client";

import React, { useState, useEffect } from 'react';
import { SwipeableProductCard } from '@/components/SwipeableProductCard';

export default function DiscoverPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GLAZE' | 'GEAR'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(10000); // 500 default max
  
  // Interaction state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Fetch products and wishlist
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch separately so one failing doesn't break the other
        const prodRes = await fetch('/api/products').catch(e => null);
        const wishRes = await fetch('/api/wishlist').catch(e => null);
        
        if (prodRes && prodRes.ok) {
          const data = await prodRes.json();
          const activeProducts = data.filter((p: any) => !p.isArchived);
          setProducts(activeProducts);
          const cats = Array.from(new Set(activeProducts.map((p: any) => p.category))) as string[];
          setCategories(cats);
        }
        
        if (wishRes && wishRes.ok) {
          const wishData = await wishRes.json();
          if (Array.isArray(wishData)) {
            setWishlist(new Set(wishData.map((w: any) => w.productId)));
          }
        }
      } catch (err) {
        console.error("Failed to fetch discover data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle filtering
  const filteredProducts = products.filter(p => {
    if (typeFilter === 'GLAZE' && !p.category.toLowerCase().includes('glaze')) return false; // simplistic type filter
    if (typeFilter === 'GEAR' && !p.category.toLowerCase().includes('gear')) return false;
    
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (p.price > maxPrice) return false;
    
    return true;
  });

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [typeFilter, categoryFilter, maxPrice]);

  const handleSwipe = (direction: 'left' | 'right', productId: string) => {
    if (direction === 'right') {
      // Swiped right strictly means ADD to wishlist
      toggleWishlist(productId, true);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const toggleWishlist = async (productId: string, forceAdd?: boolean) => {
    const isAdding = forceAdd !== undefined ? forceAdd : !wishlist.has(productId);
    
    // If we are forcing add but it's already there, do nothing
    if (forceAdd && wishlist.has(productId)) return;
    
    // Optimistic UI update
    setWishlist(prev => {
      const next = new Set(prev);
      if (isAdding) next.add(productId);
      else next.delete(productId);
      return next;
    });

    try {
      let res;
      if (isAdding) {
        res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
      } else {
        res = await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE'
        });
      }

      if (res.status === 401) {
        // User explicitly wants no error message and no UI reversion.
        // Let logged out users play with the UI seamlessly.
        return;
      }
      // Tell navbar to update its counter
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      // Revert on failure
      setWishlist(prev => {
        const next = new Set(prev);
        if (isAdding) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-sm">Discovering...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#F9EAEA]/30 flex flex-col">
      {/* Header & Filters */}
      <div className="bg-white px-4 sm:px-8 py-6 border-b border-gray-200 shadow-sm z-10 relative">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-serif font-black tracking-widest uppercase text-center mb-1">Discover</h1>
          <p className="text-gray-500 text-xs text-center tracking-widest uppercase mb-6">Swipe right to wishlist</p>
          
          <div className="flex flex-col gap-4">
            {/* Type Filter */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['ALL', 'GLAZE', 'GEAR'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t as any)}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                    typeFilter === t ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              {/* Category Filter */}
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              
              {/* Price Filter */}
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Max Price</span>
                  <span className="text-[10px] font-black">₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="100" max="20000" step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipeable Cards Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm aspect-[3/4] mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-3xl bg-white">
              <span className="text-4xl mb-3">🔍</span>
              <h3 className="font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters to see more products.</p>
              <button 
                onClick={() => { setTypeFilter('ALL'); setCategoryFilter('ALL'); setMaxPrice(10000); }}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : currentIndex >= filteredProducts.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-3xl bg-white">
              <span className="text-4xl mb-3">🎉</span>
              <h3 className="font-bold text-gray-900 mb-1">You've seen everything!</h3>
              <p className="text-gray-500 text-sm">Check your wishlist or refresh to start over.</p>
              <button 
                onClick={() => setCurrentIndex(0)}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg"
              >
                Start Over
              </button>
            </div>
          ) : (
            // Render the top 3 cards in the stack to avoid rendering too many DOM nodes
            filteredProducts.slice(currentIndex, currentIndex + 3).reverse().map((product, offsetIndex, arr) => {
              // Note: because we reversed the slice, the top card is at the end of the array.
              // So if slice is 3 items, the top card has idx = 2.
              const idx = arr.length - 1 - offsetIndex;
              const isTop = idx === 0;
              
              // Calculate stacking styles
              const scale = 1 - (idx * 0.05); // Top = 1, Second = 0.95, Third = 0.90
              const translateY = idx * 15; // Top = 0px, Second = 15px, Third = 30px
              const zIndex = 50 - idx;
              
              return (
                <SwipeableProductCard
                  key={product.id}
                  product={product}
                  isActive={isTop}
                  onSwipe={(dir) => handleSwipe(dir, product.id)}
                  isWishlisted={wishlist.has(product.id)}
                  onWishlist={toggleWishlist}
                  style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    zIndex,
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
