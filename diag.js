const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to fetch musicians with roles and department...');
    const musicians = await prisma.musician.findMany({
      include: { roles: true, department: true }
    });
    console.log('Success! Found', musicians.length, 'musicians.');
  } catch (e) {
    console.error('ERROR DETECTED:');
    console.error('Code:', e.code);
    console.error('Message:', e.message);
    if (e.meta) console.error('Meta:', e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
