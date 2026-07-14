import Link from "next/link";

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function GearsPage() {
  const gears = await prisma.product.findMany({
    where: { 
      category: {
        equals: 'gears',
        mode: 'insensitive'
      },
      isFeatured: true
    }
  });

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-[160px] md:pt-[100px]">
      {/* Hero Section */}
      <section className="h-[40vh] md:h-[50vh] flex flex-col justify-center items-center text-center px-[5%] bg-[#0a0a0a]">
        <p className="text-xs md:text-sm tracking-[4px] uppercase font-bold text-[#888] mb-4">
          The Ultimate Collection For Collectors
        </p>
        <h1 className="text-6xl md:text-[8rem] font-black font-serif leading-[1] mb-6 tracking-tight text-white uppercase">
          GEARS
        </h1>
        <p className="text-white font-medium max-w-[600px] text-sm md:text-base px-4">
          Premium scale models, rare collectibles, and precision-engineered gear for the automotive enthusiast.
        </p>
      </section>

      {/* Product Grid - UPDATED TO 2x2 FOR MOBILE */}
      <section className="py-8 sm:py-16 px-[3%] sm:px-[5%] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-[#0a0a0a] pb-[15vh] max-w-[1400px] mx-auto">
        {gears.map((product: any) => (
          <Link key={product.id} href={`/products/${product.slug || product.id}`} className="no-underline">
            <div className="bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-[10px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-white/20 cursor-pointer h-full flex flex-col p-3 sm:p-6">
              
              <div className="w-full h-[150px] sm:h-[250px] md:h-[300px] overflow-hidden relative rounded-lg sm:rounded-xl mb-3 sm:mb-6">
                <img
                  src={product.image || ''}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                />
              </div>
              
              <div className="flex flex-col flex-grow">
                <h3 className="text-[11px] sm:text-lg font-serif text-white uppercase tracking-wider mb-1 sm:mb-2 line-clamp-2 leading-tight flex-grow">{product.name}</h3>
                <p className="font-bold text-white/70 text-sm sm:text-base mb-3 sm:mb-6">₹{product.price.toLocaleString()}</p>
                <button className="w-full py-2 sm:py-3 bg-white text-black font-extrabold text-[9px] sm:text-xs uppercase tracking-widest rounded transition-all duration-500 hover:bg-[#888] hover:text-white">
                  Add to Cart
                </button>
              </div>

            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}