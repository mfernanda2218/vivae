// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // Criar organizadores
  const organizer1 = await prisma.user.upsert({
    where: { email: 'organizer@vivae.com' },
    update: {},
    create: {
      email: 'organizer@vivae.com',
      name: 'Organizador Vivae',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: 'organizer2@vivae.com' },
    update: {},
    create: {
      email: 'organizer2@vivae.com',
      name: 'Organizador Dois',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  // Criar clientes
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

  // Criar portaria
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

  // Eventos do Organizador 1
  const events1 = await Promise.all([
    prisma.event.upsert({
      where: { externalId: 'demo-neon-festival-2026' },
      update: {},
      create: {
        externalId: 'demo-neon-festival-2026',
        title: 'Neon Festival 2026',
        description: 'Uma noite de musica eletronica, arte visual e experiencias imersivas.',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
        category: 'Festivais',
        date: new Date('2026-09-18T22:00:00.000Z'),
        location: 'Sao Paulo, SP',
        capacity: 500,
        availableTickets: 500,
        price: 180,
        status: 'PUBLISHED',
        organizerId: organizer1.id,
      },
    }),
    prisma.event.upsert({
      where: { externalId: 'demo-teatro-luzes-2026' },
      update: {},
      create: {
        externalId: 'demo-teatro-luzes-2026',
        title: 'Teatro das Luzes',
        description: 'Espetaculo contemporaneo com trilha original e elenco convidado.',
        imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80',
        category: 'Teatro',
        date: new Date('2026-10-03T23:00:00.000Z'),
        location: 'Rio de Janeiro, RJ',
        capacity: 220,
        availableTickets: 220,
        price: 95,
        status: 'PUBLISHED',
        organizerId: organizer1.id,
      },
    }),
  ]);

  // Eventos do Organizador 2
  const events2 = await Promise.all([
    prisma.event.upsert({
      where: { externalId: 'demo-arena-vivae-2026' },
      update: {},
      create: {
        externalId: 'demo-arena-vivae-2026',
        title: 'Arena Vivae: Final Urbana',
        description: 'Evento esportivo com final regional, food park e shows no intervalo.',
        imageUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1400&q=80',
        category: 'Esportes',
        date: new Date('2026-11-14T19:30:00.000Z'),
        location: 'Belo Horizonte, MG',
        capacity: 1200,
        availableTickets: 1200,
        price: 70,
        status: 'PUBLISHED',
        organizerId: organizer2.id,
      },
    }),
  ]);

  console.log('Seed concluído com sucesso!');
  console.log({
    organizers: { organizer1, organizer2 },
    customers: { customer1, customer2 },
    gate,
    events1: events1.map(e => ({ id: e.id, title: e.title, organizerId: e.organizerId })),
    events2: events2.map(e => ({ id: e.id, title: e.title, organizerId: e.organizerId })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });