"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setReviews(reviews.filter((r) => r.id !== id));
      showToast("Review deleted successfully", "success");
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    const matchesRating = ratingFilter === "ALL" || String(r.rating) === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-50 text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Reviews</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">
            Moderate customer reviews. Average rating:{" "}
            <span className="text-yellow-500 font-bold">★ {avgRating}</span> across{" "}
            <span className="font-bold text-gray-700">{reviews.length}</span> reviews.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by product, user, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-72"
          />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm bg-white cursor-pointer"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★ (4)</option>
            <option value="3">★★★ (3)</option>
            <option value="2">★★ (2)</option>
            <option value="1">★ (1)</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <div
              key={star}
              className={`bg-white rounded-2xl p-4 border text-center cursor-pointer transition-all hover:shadow-md ${ratingFilter === String(star) ? "border-[#98202E] shadow-md" : "border-gray-200/60"}`}
              onClick={() => setRatingFilter(ratingFilter === String(star) ? "ALL" : String(star))}
            >
              <p className="text-yellow-400 text-lg font-black">{"★".repeat(star)}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{count}</p>
              <p className="text-xs text-gray-400 font-medium">{pct}%</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reviews found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row gap-6 items-start">
                {/* Star Rating Badge */}
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                  review.rating >= 4 ? "bg-green-50 text-green-700" :
                  review.rating === 3 ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {review.rating}★
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{review.user?.name || "Anonymous"}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-gray-500 text-sm">{review.user?.email}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#98202E] bg-[#98202E]/5 px-2 py-1 rounded">
                      {review.product?.name}
                    </span>
                    {review.product?.slug && (
                      <Link
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        View Product ↗
                      </Link>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 text-sm border border-gray-100">
                    {review.comment || <span className="italic text-gray-400">No comment provided</span>}
                  </p>
                </div>

                <button
                  onClick={() => deleteReview(review.id)}
                  disabled={deleting === review.id}
                  className="shrink-0 px-4 py-2 bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100"
                >
                  {deleting === review.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
