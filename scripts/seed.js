// Seed script: creates SuperAdmin + 2 initial tenants
// Run with: node scripts/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── SuperAdmin ──────────────────────────────────────────────────────
  const superAdminEmail = 'superadmin@troadmusic.com';
  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existing) {
    const hashed = await bcrypt.hash('SuperAdmin@123', 12);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: superAdminEmail,
        password: hashed,
        role: 'SUPERADMIN',
      },
    });
    console.log('✅ SuperAdmin created: superadmin@troadmusic.com / SuperAdmin@123');
  } else {
    console.log('ℹ️  SuperAdmin already exists.');
  }

  // ── Helper: create tenant + admin + license ────────────────────────
  async function createTenant({ name, slug, plan, expiresAt, adminEmail, adminName }) {
    let tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (tenant) {
      console.log(`ℹ️  Tenant "${name}" already exists.`);
      return tenant;
    }

    tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        license: { create: { plan, status: 'active', expiresAt: new Date(expiresAt) } },
        config: { create: { repertoireLoopDays: 15 } },
      },
    });

    const hashed = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    console.log(`✅ Tenant "${name}" created.`);
    console.log(`   Admin: ${adminEmail} / Admin@123`);
    return tenant;
  }

  // ── Tenant 1 ────────────────────────────────────────────────────────
  await createTenant({
    name: 'Igreja Louvor FC',
    slug: 'louvor-fc',
    plan: 'pro',
    expiresAt: '2027-01-01',
    adminEmail: 'admin@louvourfc.com',
    adminName: 'Admin Louvor FC',
  });

  // ── Tenant 2 ────────────────────────────────────────────────────────
  await createTenant({
    name: 'Igreja ADAD',
    slug: 'adad',
    plan: 'basic',
    expiresAt: '2027-01-01',
    adminEmail: 'admin@adad.com',
    adminName: 'Admin ADAD',
  });

  console.log('\n🎉 Seed complete!');
  console.log('\nLogins criados:');
  console.log('  SuperAdmin : superadmin@troadmusic.com  / SuperAdmin@123');
  console.log('  Louvor FC  : admin@louvourfc.com        / Admin@123');
  console.log('  ADAD       : admin@adad.com             / Admin@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
