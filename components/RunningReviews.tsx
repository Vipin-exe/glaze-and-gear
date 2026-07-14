"use client";

import React from "react";

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  productName?: string;
}

const DUMMY_REVIEWS: ReviewData[] = [
  { id: "d1", rating: 5, comment: "Absolutely stunning quality. The finish is just perfect and it feels incredibly premium.", userName: "Sarah Jenkins", productName: "Midnight Obsidian Ceramic Mug" },
  { id: "d2", rating: 5, comment: "I bought this as a gift for my husband who is a huge car enthusiast. He loved it!", userName: "Emily R.", productName: "Carbon Fiber Shift Knob" },
  { id: "d3", rating: 4, comment: "Really solid build. Fits exactly as described and shipping was surprisingly fast.", userName: "Michael T.", productName: "Titanium Key Fob Cover" },
  { id: "d4", rating: 5, comment: "The glaze work on this is beautiful. You can tell it's handcrafted with a lot of care.", userName: "Jessica Wong", productName: "Artisan Matcha Bowl" },
  { id: "d5", rating: 5, comment: "Looks even better in person than in the photos. Excellent customer service too.", userName: "David L.", productName: "Matte Black Espresso Cup" },
];

export default function RunningReviews({ initialReviews }: { initialReviews: ReviewData[] }) {
  // If there are less than 5 real reviews, pad with dummy reviews
  let reviewsToDisplay = [...initialReviews];
  if (reviewsToDisplay.length < 5) {
    const needed = 5 - reviewsToDisplay.length;
    reviewsToDisplay = [...reviewsToDisplay, ...DUMMY_REVIEWS.slice(0, needed)];
  }

  // Double the array to ensure smooth infinite scrolling
  const marqueeItems = [...reviewsToDisplay, ...reviewsToDisplay, ...reviewsToDisplay];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden relative border-y border-gray-200/50">
      <div className="text-center mb-12 px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 tracking-tight">What Our Customers Say</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Real experiences from our Glaze & Gear community.</p>
      </div>

      <div className="relative w-full flex items-center">
        {/* Gradient fades on the edges for smooth entry/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

        <div className="flex animate-marquee hover:pause">
          {marqueeItems.map((review, idx) => (
            <div 
              key={`${review.id}-${idx}`} 
              className="flex-shrink-0 w-[350px] md:w-[400px] mx-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#98202E]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-6">"{review.comment}"</p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#98202E]/10 flex items-center justify-center text-[#98202E] font-bold">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                  {review.productName && (
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                      {review.productName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); } /* Moves one full set length */
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
