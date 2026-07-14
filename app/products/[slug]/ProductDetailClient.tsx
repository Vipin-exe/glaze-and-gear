"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const router = useRouter();

  const fetchProduct = () => {
    if (slug) {
      fetch(`/api/products/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then(data => {
          setProduct(data);
          
          // Fetch related products
          if (data.category) {
            fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
              .then(res => res.json())
              .then(related => {
                if (Array.isArray(related)) {
                  setRelatedProducts(related.filter((p: any) => p.id !== data.id).slice(0, 4));
                }
              })
              .catch(console.error);
          }

          if (status === "authenticated") {
            fetch('/api/wishlist')
              .then(res => res.json())
              .then(wishlist => {
                if (Array.isArray(wishlist)) {
                  setInWishlist(wishlist.some(item => item.productId === data.id));
                }
              })
              .catch(console.error);
          }
        })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug, status]);

  const addToCart = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Product added to cart!');
    } catch (err) {
      alert("Failed to add to cart.");
    }
  };

  const buyNow = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      window.dispatchEvent(new Event('cartUpdated'));
      router.push("/cart");
    } catch (err) {
      alert("Failed to proceed.");
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    const previousState = inWishlist;
    setInWishlist(!inWishlist);

    try {
      if (previousState) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      setInWishlist(previousState);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setReviewForm({ rating: 5, comment: "" });
        fetchProduct(); // Refresh reviews
        alert("Review submitted successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return (
    <div className="pt-[150px] pb-[100px] px-[5%] max-w-[1200px] mx-auto min-h-screen grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-pulse">
      <div className="w-full aspect-square rounded-[20px] bg-gray-200"></div>
      <div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-6"></div>
        <div className="h-14 w-3/4 bg-gray-200 rounded mb-6"></div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-10"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
      </div>
    </div>
  );

  const averageRating = product.reviews?.length 
    ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "No reviews yet";

  return (
    <div className="pt-[150px] pb-[100px] px-[5%] max-w-[1200px] mx-auto min-h-screen flex flex-col gap-16">
      
      {/* Product Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="w-full aspect-square rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(152,32,46,0.15)] relative">
          <button 
            onClick={toggleWishlist}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] group/btn"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={inWishlist ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth={inWishlist ? "0" : "2"} 
              className={`w-6 h-6 transition-all duration-300 ${inWishlist ? "text-[#98202E] scale-110" : "text-gray-400 group-hover/btn:text-[#98202E] group-hover/btn:scale-110"}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[3px] opacity-70 mb-4 text-[#98202E]">{product.category}</p>
          <h1 className="text-4xl md:text-6xl font-serif text-[#98202E] mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-gray-600 font-bold">{averageRating}</span>
            <span className="text-gray-400 text-sm">({product.reviews?.length || 0} reviews)</span>
          </div>
          <p className="text-3xl font-extrabold text-[#D09399] mb-4">₹{product.price.toLocaleString('en-IN')}</p>
          
          {product.stock === 0 ? (
            <div className="inline-block px-4 py-1.5 bg-red-50 text-red-600 font-bold uppercase tracking-[2px] text-[10px] rounded mb-6 border border-red-100">
              Out of Stock
            </div>
          ) : product.stock <= 5 ? (
            <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 font-bold uppercase tracking-[2px] text-[10px] rounded mb-6 border border-amber-100">
              ⚡ Only {product.stock} left in stock!
            </div>
          ) : (
            <div className="inline-block px-4 py-1.5 bg-green-50 text-green-600 font-bold uppercase tracking-[2px] text-[10px] rounded mb-6 border border-green-100">
              In Stock
            </div>
          )}

          <p className="text-lg opacity-90 mb-8 text-[#98202E] leading-relaxed">{product.description}</p>
          
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[#98202E] mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
                className="w-10 h-10 rounded-full border-2 border-[#98202E] flex items-center justify-center text-[#98202E] font-bold text-xl hover:bg-[#98202E]/5 disabled:opacity-50"
              >−</button>
              <input 
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setQuantity(Math.min(Math.max(1, val), product.stock || 1));
                  }
                }}
                disabled={product.stock === 0}
                className="font-bold text-xl w-16 text-center border-b-2 border-[#98202E] outline-none bg-transparent disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0 || quantity >= product.stock}
                className="w-10 h-10 rounded-full border-2 border-[#98202E] flex items-center justify-center text-[#98202E] font-bold text-xl hover:bg-[#98202E]/5 disabled:opacity-50"
              >+</button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={buyNow} 
              disabled={product.stock === 0}
              className="flex-1 min-w-[200px] py-4 px-8 bg-[#98202E] text-white font-bold text-sm uppercase tracking-widest rounded hover:opacity-80 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Buy Now
            </button>
            <button 
              onClick={addToCart} 
              disabled={product.stock === 0}
              className="flex-1 min-w-[200px] py-4 px-8 bg-transparent border-2 border-[#98202E] text-[#98202E] font-bold text-sm uppercase tracking-widest rounded hover:opacity-80 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:bg-transparent"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-[#98202E]/20 pt-16 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <h2 className="text-3xl font-serif text-[#98202E]">Customer Reviews</h2>
          {status === "authenticated" && (
            <button 
              onClick={() => document.getElementById('review-form')?.classList.toggle('hidden')}
              className="px-6 py-3 border-2 border-[#98202E] text-[#98202E] font-bold uppercase tracking-widest text-xs rounded hover:bg-[#98202E] hover:text-white transition-all"
            >
              Write a Review
            </button>
          )}
        </div>
        
        {/* Hidden Form by default */}
        {status === "authenticated" && (
          <div id="review-form" className="hidden bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 mb-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-serif text-[#98202E] mb-6">Share your experience</h3>
            <form onSubmit={submitReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className={`text-2xl transition-colors ${reviewForm.rating >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2 mt-2">Comment</label>
                <textarea 
                  required
                  placeholder="Tell us what you loved about this product..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] min-h-[120px] transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={submittingReview}
                className="mt-4 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-12 max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
            <p className="text-gray-500 font-medium">Log in to share your experience</p>
            <button onClick={() => router.push('/login')} className="bg-[#98202E] text-white px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#7a1a25] transition-colors">
              Login to Review
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Reviews Summary Column (Left) */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
            <div className="text-center md:text-left">
              <p className="text-5xl font-black font-serif text-[#98202E] mb-2">{averageRating}</p>
              <div className="flex justify-center md:justify-start text-yellow-400 text-xl mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(Number(averageRating) || 0) ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">
                {product.reviews?.length || 0} {(product.reviews?.length === 1) ? 'Review' : 'Reviews'}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = product.reviews?.filter((r: any) => r.rating === star).length || 0;
                const total = product.reviews?.length || 1;
                const percent = (count / total) * 100;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-8 text-right font-medium">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-8 text-xs text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List (Right) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review: any) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#98202E]/10 text-[#98202E] rounded-full flex items-center justify-center font-black uppercase text-lg">
                        {review.user?.name ? review.user.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center h-full min-h-[250px]">
                <div className="text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-serif text-gray-900 mb-2">No reviews yet</h4>
                <p className="text-gray-500 max-w-sm">We'd love to hear your thoughts! Be the first to review this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length >= 2 && (
        <div className="border-t border-[#98202E]/20 pt-16 mt-16 mb-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[4px] text-gray-500 mb-2 font-bold">Discover More</p>
            <h2 className="text-4xl font-serif text-[#98202E]">You May Also Like</h2>
          </div>
          
          <div 
            className="flex overflow-x-auto pb-8 -mx-[5%] px-[5%] md:mx-0 md:px-0 gap-6 md:gap-8 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Added style above to hide scrollbar on Firefox. For Webkit (Chrome/Safari) we use tailwind arbitrary variant below or just rely on CSS */}
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="flex gap-6 md:gap-8 hide-scrollbar w-full md:grid md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(p => (
                <div key={p.id} className="w-[85vw] md:w-auto flex-shrink-0 snap-center">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
