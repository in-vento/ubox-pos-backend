const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
      const orderCount = await prisma.order.count();
      console.log(`Orders: ${orderCount}`);
  } catch (e) { console.log('Error counting orders:', e.message); }

  try {
      const productCount = await prisma.product.count();
      console.log(`Products: ${productCount}`);
  } catch (e) { console.log('Error counting products:', e.message); }
  
  try {
      const userCount = await prisma.user.count();
      console.log(`Users: ${userCount}`);
  } catch (e) { console.log('Error counting users:', e.message); }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());