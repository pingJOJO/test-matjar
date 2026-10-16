import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const catCount = await prisma.category.count();
  console.log(`Connected to Database! Total Products: ${count}, Total Categories: ${catCount}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Prisma error:", err);
  process.exit(1);
});
