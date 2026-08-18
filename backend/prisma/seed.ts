import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@vivae.com' },
    update: {},
    create: {
      email: 'organizer@vivae.com',
      name: 'Organizador Vivae',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'cliente1@vivae.com' },
    update: {},
    create: {
      email: 'cliente1@vivae.com',
      name: 'Cliente 1',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'cliente2@vivae.com' },
    update: {},
    create: {
      email: 'cliente2@vivae.com',
      name: 'Cliente 2',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const gate = await prisma.user.upsert({
    where: { email: 'portaria@vivae.com' },
    update: {},
    create: {
      email: 'portaria@vivae.com',
      name: 'Portaria',
      passwordHash,
      role: 'GATE',
    },
  });

  console.log({ organizer, customer1, customer2, gate });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
