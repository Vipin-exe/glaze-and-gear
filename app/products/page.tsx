"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
};

function ProductsContent() {
  const searchParams = useSearchParams();
  
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const matchesCategory = filter === "all" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    return 0; // "featured" keeps original order
  });

  return (
    <div className="bg-white min-h-screen text-[#98202E]">
      {/* Hero Section */}
      <section className="pt-[150px] pb-[50px] text-center bg-[radial-gradient(circle_at_center,#fff_0%,var(--white)_100%)]">
        <h1 className="text-5xl md:text-[5rem] font-black font-serif tracking-tight bg-gradient-to-b from-[#98202E] to-[#4a0e16] bg-clip-text text-transparent">
          Our Products
        </h1>
      </section>

      {/* Search and Filter */}
      <div className="py-8 px-[5%] flex flex-col items-center gap-6 bg-white w-full max-w-7xl mx-auto">
        <div className="w-full max-w-2xl relative flex items-center">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-8 pr-14 border-2 border-[#98202E]/20 rounded-full focus:outline-none focus:border-[#98202E] text-[#98202E] placeholder:text-[#98202E]/40 font-bold transition-all shadow-sm"
          />
          <span className="absolute right-6 opacity-50 text-xl pointer-events-none">
            🔍
          </span>
        </div>

        <div className="flex justify-center items-center gap-6 flex-wrap w-full max-w-4xl">
          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto w-full max-w-full pb-2 snap-x scrollbar-hide md:flex-wrap md:justify-center md:overflow-visible">
            {[
              { id: "all", label: "All" },
              { id: "glaze", label: "Glaze" },
              { id: "gears", label: "Gears" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-5 sm:py-3 sm:px-6 border-2 border-[#98202E] font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full transition-all duration-300 snap-center whitespace-nowrap shrink-0 ${
                  filter === tab.id ? "bg-[#98202E] text-white shadow-lg shadow-[#98202E]/20" : "bg-white text-[#98202E] hover:bg-[#98202E]/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-3 px-6 pr-10 border-2 border-[#98202E] font-bold text-sm uppercase tracking-widest rounded-full bg-white text-[#98202E] cursor-pointer outline-none hover:bg-[#98202E]/5 appearance-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#98202E]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-8 sm:py-12 px-[3%] sm:px-[5%] pb-[15vh] grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 bg-white max-w-7xl mx-auto">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-6 rounded-[20px] animate-pulse">
              <div className="w-full aspect-square rounded-xl mb-6 bg-gray-200"></div>
              <div className="h-3 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-6"></div>
              <div className="flex flex-col gap-2">
                <div className="w-full h-[40px] bg-gray-200 rounded"></div>
                <div className="w-full h-[40px] bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-serif text-gray-400 italic mb-6 text-center">No products found matching your search.</h2>
            <button onClick={() => { setSearchQuery(""); setFilter("all"); setSort("featured"); }} className="px-8 py-3 bg-transparent border border-[#98202E] text-[#98202E] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#98202E]/5 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-[150px] text-center text-[#98202E] font-bold">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}