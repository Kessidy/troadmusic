const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const depts = await prisma.department.findMany();
  console.log('--- ALL DEPARTMENTS ---');
  depts.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.name}`);
  });

  const events = await prisma.event.findMany({
    include: { department: true }
  });
  
  console.log('\n--- ALL EVENTS ---');
  events.forEach(e => {
    console.log(`Event: ${e.name} | Status: ${e.status} | Dept: ${e.department ? e.department.name : 'NONE'} (${e.departmentId})`);
  });
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
