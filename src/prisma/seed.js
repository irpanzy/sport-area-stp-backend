const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin created');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
