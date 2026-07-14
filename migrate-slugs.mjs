import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Migrating product slugs...');
  const products = await prisma.product.findMany();
  
  for (const product of products) {
    if (!product.slug || product.slug === '') {
      let slug = generateSlug(product.name);
      
      // Ensure unique slug
      let uniqueSlug = slug;
      let counter = 1;
      while (true) {
        const existing = await prisma.product.findFirst({ where: { slug: uniqueSlug, id: { not: product.id } } });
        if (!existing) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: uniqueSlug }
      });
      console.log(`Updated ${product.name} -> ${uniqueSlug}`);
    }
  }
  
  console.log('Migration complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
