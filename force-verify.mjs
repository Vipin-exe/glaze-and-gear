import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying tamilselvan...');
  
  const user = await prisma.user.update({
    where: { email: 'aktamil13@gmail.com' },
    data: { emailVerified: new Date() }
  });
  
  console.log(`Successfully verified user: ${user.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
