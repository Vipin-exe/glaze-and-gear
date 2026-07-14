"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  slug: string;
}

interface SwipeableProductCardProps {
  product: Product;
  isActive: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  onWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

export function SwipeableProductCard({
  product,
  isActive,
  onSwipe,
  style,
  onWishlist,
  isWishlisted
}: SwipeableProductCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const router = useRouter();
  
  const startPos = useRef({ x: 0, y: 0 });
  
  const SWIPE_THRESHOLD = 120; // Pixels required to trigger swipe

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive) return;
    
    // Don't drag if they are clicking a button
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }

    setIsDragging(true);
    startPos.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };
    
    // Prevent default touch actions (scrolling) while dragging
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isActive) return;
    setDrag({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !isActive) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (drag.x > SWIPE_THRESHOLD) {
      // Swiped Right
      setExitDirection('right');
      setTimeout(() => onSwipe('right'), 300); // Wait for exit animation
    } else if (drag.x < -SWIPE_THRESHOLD) {
      // Swiped Left
      setExitDirection('left');
      setTimeout(() => onSwipe('left'), 300);
    } else {
      // If it was just a tap (barely moved), navigate to the product page
      if (Math.abs(drag.x) < 5 && Math.abs(drag.y) < 5) {
        router.push(`/products/${product.slug}`);
      }
      // Spring back to center
      setDrag({ x: 0, y: 0 });
    }
  };

  // Calculate dynamic transform
  let transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.05}deg)`;
  let opacity = 1;

  if (exitDirection === 'right') {
    transform = `translate(150vw, ${drag.y}px) rotate(45deg)`;
    opacity = 0;
  } else if (exitDirection === 'left') {
    transform = `translate(-150vw, ${drag.y}px) rotate(-45deg)`;
    opacity = 0;
  }

  // Calculate overlay opacity (Like / Pass indicators)
  const rightOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const leftOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <div
      style={{
        ...style,
        transform: style?.transform ? `${style.transform} ${transform}` : transform,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease',
        touchAction: 'none'
      }}
      className={`absolute top-0 left-0 w-full h-full rounded-3xl shadow-xl border border-gray-100 bg-white overflow-hidden flex flex-col ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top action bar: Wishlist */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(product.id);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
            isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 backdrop-blur text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Swipe Indicators */}
      {isActive && (
        <>
          <div 
            className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-black text-3xl px-4 py-1 rounded-xl uppercase tracking-widest z-20 rotate-[-15deg] pointer-events-none"
            style={{ opacity: rightOpacity }}
          >
            LIKE
          </div>
          <div 
            className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black text-3xl px-4 py-1 rounded-xl uppercase tracking-widest z-20 rotate-[15deg] pointer-events-none"
            style={{ opacity: leftOpacity }}
          >
            NOPE
          </div>
        </>
      )}

      {/* Product Image */}
      <div className="relative flex-1 bg-gray-100 overflow-hidden pointer-events-none">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif text-2xl">Glaze & Gear</div>
        )}
        {/* Subtle gradient to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>

      {/* Product Info (overlaps image slightly at the bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none flex flex-col justify-end">
        <span className="text-xs font-black tracking-widest uppercase mb-1 bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded">
          {product.category}
        </span>
        <h2 className="text-3xl font-serif font-black tracking-wide leading-tight mb-2 drop-shadow-md">
          {product.name}
        </h2>
        <div className="text-2xl font-black text-gray-100 drop-shadow-md">
          ₹{product.price.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
