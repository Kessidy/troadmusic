const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const depts = await prisma.department.findMany();
  const louvorDepts = depts.filter(d => d.name.toLowerCase().includes('louvor'));
  
  console.log('--- Louvor Departments ---');
  louvorDepts.forEach(d => {
    console.log(`ID: ${d.id} | Name: ${d.name}`);
  });

  const events = await prisma.event.findMany({
    where: { status: 'ativo' },
    include: { department: true }
  });
  
  console.log('\n--- Events with Louvor Dept ---');
  events.filter(e => e.department && e.department.name.toLowerCase().includes('louvor')).forEach(e => {
    console.log(`Event: ${e.name} | EventID: ${e.id} | DeptID on Event: ${e.departmentId} | Resolved Dept ID: ${e.department.id}`);
  });

  if (louvorDepts.length > 0 && events.length > 0) {
    const l01 = louvorDepts.find(d => d.name.toLowerCase() === 'louvor 01');
    if (l01) {
      const match = events.some(e => e.departmentId === l01.id);
      console.log(`\nMatch check for Louvor 01 (${l01.id}): ${match ? 'FOUND' : 'NOT FOUND'}`);
    }
  }
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
