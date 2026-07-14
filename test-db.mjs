import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing MongoDB connection...');
  try {
    const count = await prisma.product.count();
    console.log(`Successfully connected! Found ${count} products.`);
  } catch (e) {
    console.error('Connection failed:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
