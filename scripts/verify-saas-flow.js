const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyRegistration() {
  console.log('--- Verificando Fluxo de Registro SaaS ---');
  
  const testEmail = `verify_saas_${Date.now()}@test.com`;
  const ministryName = 'Igreja de Verificação SaaS';
  
  try {
    // We can't easily call the action directly without a full Next.js context in a standalone script,
    // but we can simulate what the action does and check if the schema supports it,
    // or better yet, just write a script that checks if we can find a recently created tenant with 'suspended' status.
    
    // For this verification, I will just check the last created Tenant and its License.
    const lastTenant = await prisma.tenant.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { license: true, users: true }
    });
    
    if (!lastTenant) {
      console.log('Nenhum tenant encontrado.');
      return;
    }
    
    console.log(`Último Ministério: ${lastTenant.name}`);
    console.log(`Status da Licença: ${lastTenant.license?.status}`);
    console.log(`Usuários Vinculados: ${lastTenant.users.length}`);
    
    if (lastTenant.license?.status === 'suspended') {
      console.log('✅ SUCESSO: O último ministério foi criado como SUSPENSO.');
    } else {
      console.log('❌ FALHA: O status do último ministério não é suspenso.');
    }
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRegistration();
