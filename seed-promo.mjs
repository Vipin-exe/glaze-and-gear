import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const code = "SUMMER20";
    
    // Check if exists
    const existing = await prisma.promoCode.findUnique({
      where: { code }
    });
    
    if (!existing) {
      await prisma.promoCode.create({
        data: {
          code,
          discountPercent: 20,
          isActive: true
        }
      });
      console.log(`Successfully created promo code: ${code} (20% OFF)`);
    } else {
      console.log(`Promo code ${code} already exists.`);
    }
  } catch (error) {
    console.error("Error seeding promo code:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
