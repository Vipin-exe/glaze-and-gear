import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const products = [
    { name: "Artisan Floral Vase", category: "glaze", price: 12999, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=500&auto=format&fit=crop", description: "Handcrafted ceramic vase with intricate floral designs, perfect for adding a touch of elegance to your home decor." },
    { name: "Leather Heritage Kit", category: "gears", price: 18999, image: "https://images.unsplash.com/photo-1524333865941-245026d02bcb?q=80&w=500&auto=format&fit=crop", description: "Premium leather kit with essential tools and accessories for the modern gentleman, crafted from genuine leather." },
    { name: "Signature Couple's Box", category: "glaze", price: 15999, image: "https://images.unsplash.com/photo-1549465220-1d8c9d9c6703?q=80&w=500&auto=format&fit=crop", description: "A beautiful curated gift box for couples, featuring hand-picked items that celebrate your love and connection." },
    { name: "Collector's Hot Wheels", category: "gears", price: 3999, image: "https://images.unsplash.com/photo-1532330393533-443990a51d10?q=80&w=1000&auto=format&fit=crop", description: "Limited edition collector's Hot Wheels set, perfect for car enthusiasts and collectors alike." },
    { name: "1:18 Precision Scale Model", category: "gears", price: 19999, image: "https://images.unsplash.com/photo-1581235720704-06d3acfcba8e?q=80&w=1000&auto=format&fit=crop", description: "Highly detailed 1:18 scale die-cast model, featuring realistic details and authentic design elements." },
    { name: "Vintage Racing Print Set", category: "gears", price: 7499, image: "https://images.unsplash.com/photo-1618123069754-cd64c210d167?q=80&w=1000&auto=format&fit=crop", description: "Set of vintage racing prints, perfect for decorating your garage, office, or living space." },
    { name: "Carbon Fiber Gear Set", category: "gears", price: 15999, image: "https://images.unsplash.com/photo-1549465220-1d8c9d9c6703?q=80&w=1000&auto=format&fit=crop", description: "Carbon fiber gear set designed for both style and performance, perfect for automotive enthusiasts." }
  ];

  await prisma.product.deleteMany({}); // Clear existing products
  
  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
