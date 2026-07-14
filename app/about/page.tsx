import Link from "next/link";

export const metadata = {
  title: "About Us | Glaze & Gear",
  description: "Learn about the craftsmanship and passion behind Glaze & Gear's curated gifts and premium accessories.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen text-[#98202E]">
      {/* Hero Section */}
      <section className="pt-[150px] pb-[100px] px-[5%] text-center bg-[radial-gradient(circle_at_center,#fff_0%,var(--white)_100%)] relative">
        <p className="text-xs md:text-sm tracking-[3px] uppercase text-[#D09399] mb-4">
          Our Story
        </p>
        <h1 className="text-[3rem] md:text-[5rem] font-black font-serif leading-[1] mb-6 tracking-tight bg-gradient-to-b from-[#98202E] to-[#4a0e16] bg-clip-text text-transparent">
          Crafting Moments, <br /> Engineering Memories.
        </h1>
        <p className="max-w-[700px] mx-auto text-lg opacity-80 leading-relaxed text-gray-700">
          At Glaze & Gear, we believe that the best gifts are more than just objects—they are a reflection of the connections we share. Whether it's a timeless piece of home decor or a precision-engineered accessory, every item in our collection is curated to celebrate the people you love.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="py-[10vh] px-[5%] max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-serif text-[#98202E]">The Glaze Philosophy</h2>
          <p className="text-gray-600 leading-relaxed">
            The "Glaze" in our name represents the artisanal, the delicate, and the beautiful. It's about bringing warmth and elegance into everyday life through carefully selected home decor and timeless gifts. We focus on aesthetics, quality materials, and the kind of craftsmanship that turns a simple object into a cherished memory.
          </p>
        </div>
        <div className="order-1 md:order-2 aspect-square rounded-[30px] bg-[#98202E]/5 p-8 flex items-center justify-center border border-[#98202E]/10">
          <div className="text-[6rem] opacity-20">✨</div>
        </div>
      </section>

      {/* Gear Section */}
      <section className="py-[10vh] px-[5%] max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-square rounded-[30px] bg-[#0a0a0a] p-8 flex items-center justify-center border border-white/10 shadow-xl shadow-black/20">
          <div className="text-[6rem] opacity-20 grayscale">⚙️</div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-serif text-[#98202E]">The Gear Philosophy</h2>
          <p className="text-gray-600 leading-relaxed">
            "Gear" is for the modern gentleman—driven by function, durability, and bold design. From automotive-inspired accessories to precision tools, this side of our collection is built for performance. It's for those who appreciate the mechanics of life and demand quality in their everyday carry.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[12vh] px-[5%] text-center bg-[#F9EAEA]/50 border-t border-[#98202E]/10 mt-[5vh]">
        <h2 className="text-[2.5rem] md:text-[3.5rem] font-serif mb-6 text-[#98202E]">Experience the Collection</h2>
        <p className="max-w-[600px] mx-auto mb-10 text-gray-600">
          Discover the perfect balance of artisanal beauty and engineered precision.
        </p>
        <Link href="/products" className="inline-block py-4 px-10 bg-[#98202E] text-white font-bold uppercase tracking-[2px] rounded-xl shadow-xl shadow-[#98202E]/20 hover:-translate-y-1 hover:bg-[#7a1a25] transition-all">
          Shop Now
        </Link>
      </section>
    </div>
  );
}
