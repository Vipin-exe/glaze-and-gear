import Link from "next/link";

import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import RunningReviews from '@/components/RunningReviews';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const shopProducts = await prisma.product.findMany({
    where: {
      category: {
        equals: 'glaze',
        mode: 'insensitive'
      },
      isFeatured: true
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const rawReviews = await prisma.review.findMany({
    where: { rating: { gte: 4 } }, // Show positive reviews on homepage
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const initialReviews = rawReviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment || '',
    userName: r.user?.name || 'Anonymous',
    productName: r.product?.name
  }));

  return (
    <div className="bg-white min-h-screen text-[#98202E]">
      {/* Hero Section */}
      <section className="h-auto min-h-[70vh] md:min-h-screen pt-[160px] md:pt-[120px] md:pt-0 pb-10 flex flex-col justify-start md:justify-center items-center text-center px-[5%] bg-[radial-gradient(circle_at_center,#fff_0%,var(--white)_100%)] relative">
        <p className="text-[0.75rem] md:text-lg tracking-[1px] md:tracking-[3px] uppercase text-[#D09399] mb-4 max-w-[90%] md:max-w-[80%]">
          Gifts as special as your connection
        </p>
        <h1 className="text-[2.2rem] md:text-[8rem] font-black font-serif leading-[0.95] mb-4 md:mb-6 tracking-[-0.5px] md:tracking-[-3px] bg-gradient-to-b from-[#98202E] to-[#4a0e16] bg-clip-text text-transparent">
          Glaze & Gear
        </h1>
        <div className="mt-4 md:mt-8 max-w-[600px]">
          <p className="text-[#98202E]/80 font-medium md:text-lg">
            Handcrafted treasures curated to celebrate the people you love. Because every moment with them is a gift.
          </p>
        </div>
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row flex-wrap gap-4 justify-center w-full max-w-[400px] md:max-w-none mx-auto">
          <Link href="/#shop" className="w-full md:w-auto py-4 px-8 md:py-[1.2rem] md:px-[3rem] bg-[#98202E] text-white font-bold uppercase tracking-[2px] rounded md:rounded-md shadow-lg transition-transform hover:-translate-y-1 text-sm md:text-base">
            Shop Gifts
          </Link>
          <Link href="/gears" className="w-full md:w-auto py-4 px-8 md:py-[1.2rem] md:px-[3rem] bg-transparent border-2 border-[#98202E] text-[#98202E] font-bold uppercase tracking-[2px] rounded md:rounded-md transition-transform hover:-translate-y-1 text-sm md:text-base">
            Explore Gears
          </Link>
        </div>
      </section>


      {/* Men's Gear Section */}
      <section id="mens-gear" className="py-[8vh] px-[5%] bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-[1200px] mx-auto relative z-10 text-center md:text-left">
          <div className="order-2 md:order-1">
            <p className="uppercase tracking-[4px] text-xs mb-4 text-[#888]">The Modern Gentleman</p>
            <h2 className="text-[2.5rem] md:text-[4rem] font-serif leading-[1.1] mb-6">Gears for Him</h2>
            <p className="text-base md:text-lg mb-8 opacity-90 max-w-[500px] mx-auto md:mx-0">
              Engineered for durability, designed for style. From precision tools to everyday essentials, discover the gear that defines the way he lives.
            </p>
            <Link href="/products" className="inline-block w-full md:w-auto py-4 px-[3.5rem] bg-white text-black font-bold uppercase tracking-widest rounded text-xs md:text-sm transition-transform hover:-translate-y-1">
              View Full Collection
            </Link>
          </div>
          <div className="order-1 md:order-2 aspect-[16/10] rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <img src="/F1 CAR.png" alt="Men's Premium Gear" className="w-full h-full object-cover contrast-110 brightness-90" />
          </div>
        </div>
        <div className="absolute -bottom-[10%] -left-[5%] text-[20vh] md:text-[50vh] font-black opacity-[0.03] -rotate-12 pointer-events-none select-none text-white">
          GEAR
        </div>
      </section>

      {/* Celebrate Every Occasion */}
      <section className="py-[10vh] px-[5%] bg-white text-center max-w-[1200px] mx-auto">
        <h2 className="text-[2.5rem] font-serif mb-12">Celebrate Every Occasion</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Anniversaries", desc: "Timeless pieces for lasting love." },
            { title: "Birthdays", desc: "Unique finds for their special day." },
            { title: "Just Because", desc: "Small tokens of big appreciation." },
            { title: "New Beginnings", desc: "Celebrate life's biggest milestones." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl cursor-pointer bg-gradient-to-br from-white/30 to-black/5 backdrop-blur-md border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all">
              <h3 className="text-2xl font-serif">{item.title}</h3>
              <p className="text-sm mt-4 opacity-70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop Section - UPDATED TO 2x2 FOR MOBILE */}
      <section id="shop" className="py-[8vh] px-[3%] sm:px-[5%] max-w-[1200px] mx-auto bg-white">
         <div className="text-center mb-8 sm:mb-12">
           <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[4rem] font-serif text-[#98202E]">Glaze Collection</h2>
         </div>
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {shopProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Personalization Section */}
      <section className="my-[5vh] mx-[5%] p-[8vh_5%] rounded-[20px] md:rounded-[30px] text-center bg-[#98202E]/5 max-w-[1200px] md:mx-auto">
        <h2 className="text-[2rem] md:text-[2.2rem] font-serif mb-6">The Finishing Touch</h2>
        <p className="max-w-[700px] mx-auto mb-8 opacity-80 text-sm md:text-base px-4">
          Every Glaze & Gear gift arrives in our signature premium packaging, complete with a hand-written note to make your loved one feel truly special.
        </p>
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          <span className="font-bold text-[10px] md:text-sm uppercase tracking-[2px]">• Luxury Gift Wrap</span>
          <span className="font-bold text-[10px] md:text-sm uppercase tracking-[2px]">• Custom Personal Note</span>
          <span className="font-bold text-[10px] md:text-sm uppercase tracking-[2px]">• Worldwide Shipping</span>
        </div>
      </section>

      {/* Footer Quote & Newsletter */}
      <section className="py-[8vh] px-[5%] text-center bg-white min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center items-center">
        <div className="text-[1.8rem] md:text-[4rem] font-serif font-bold leading-[1.2] mb-8 text-[#98202E] max-w-[800px]">
          "Unwrap the magic of artisanal craft."
        </div>
        <div className="text-xs md:text-sm uppercase tracking-[4px] md:tracking-[6px] opacity-70 mb-8 md:mb-12">Join the Circle</div>
        <NewsletterForm />
      </section>

      {/* Running Reviews Marquee */}
      <RunningReviews initialReviews={initialReviews} />
    </div>
  );
}