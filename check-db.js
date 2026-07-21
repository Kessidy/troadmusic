const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const depts = await prisma.department.findMany();
  console.log('--- DEPARTMENTS ---');
  depts.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.name}`);
  });

  const events = await prisma.event.findMany({
    where: { status: 'ativo' },
    include: { department: true }
  });
  console.log('\n--- ACTIVE EVENTS ---');
  events.forEach(e => {
    console.log(`Event: ${e.name} | DeptID on Event: ${e.departmentId} | Resolved Dept: ${e.department ? e.department.name : 'NONE'}`);
  });
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
