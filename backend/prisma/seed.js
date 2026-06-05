// backend/prisma/seed.js
// Seeds the DB with sample data so the app isn't empty on first boot.
// Owner: Basnet Anjali (DB) + Sapkota Pratik (backend)

const { PrismaClient, UserRole, ReportCategory, ReportStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');   // if you installed bcryptjs instead, change this to require('bcryptjs')

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Wipe in child-before-parent order to satisfy foreign keys
  await prisma.notification.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.media.deleteMany();
  await prisma.report.deleteMany();
  await prisma.authority.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@crowdfix.np',
      passwordHash,
      name: 'System Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  const wardOfficer = await prisma.user.create({
    data: {
      email: 'ward4@kmc.np',
      passwordHash,
      name: 'KMC Ward 4 Officer',
      role: UserRole.AUTHORITY,
      emailVerified: true,
      authority: {
        create: {
          jurisdiction: 'KMC Ward 4',
          department: 'Roads & Infrastructure',
          officerTitle: 'Ward Engineer',
        },
      },
    },
    include: { authority: true },
  });

  const citizen = await prisma.user.create({
    data: {
      email: 'citizen@example.com',
      passwordHash,
      name: 'Ramesh Sharma',
      phone: '+977-9800000000',
      role: UserRole.CITIZEN,
      emailVerified: true,
    },
  });

  // --- Reports ---
  const report1 = await prisma.report.create({
    data: {
      reporterId: citizen.id,
      title: 'Large pothole near Patan Durbar Square',
      description: 'Deep pothole on the road approaching the south gate. Causing accidents at night.',
      category: ReportCategory.INFRASTRUCTURE,
      status: ReportStatus.OPEN,
      latitude: 27.6726,
      longitude: 85.3239,
      address: 'Patan Durbar Square, Lalitpur',
    },
  });

  await prisma.report.create({
    data: {
      reporterId: citizen.id,
      authorityId: wardOfficer.authority.id,
      title: 'Streetlight not working — New Road',
      description: 'Streetlight at the corner of New Road and Indra Chowk has been out for a week.',
      category: ReportCategory.UTILITIES,
      status: ReportStatus.ASSIGNED,
      latitude: 27.7041,
      longitude: 85.3083,
      address: 'New Road, Kathmandu',
    },
  });

  // --- One comment + one upvote (sanity-check the relationships) ---
  await prisma.comment.create({
    data: {
      reportId: report1.id,
      userId: wardOfficer.id,
      body: 'Acknowledged. Will dispatch a team this week.',
    },
  });

  await prisma.upvote.create({
    data: { reportId: report1.id, userId: wardOfficer.id },
  });

  await prisma.report.update({
    where: { id: report1.id },
    data: { upvoteCount: 1 },
  });

  console.log('✅ Seed complete');
  console.log('   Admin:   admin@crowdfix.np      / Password123!');
  console.log('   Officer: ward4@kmc.np           / Password123!');
  console.log('   Citizen: citizen@example.com    / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });