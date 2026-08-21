import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

type EventRecord = {
  id: string;
  externalId?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  category: string;
  date: Date;
  location: string;
  capacity: number;
  availableTickets: number;
  price: number;
  status: string;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
};

const publicUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createPrismaMock = () => {
  const users: UserRecord[] = [];
  const events: EventRecord[] = [];

  const eventWithOrganizer = (event: EventRecord) => ({
    ...event,
    organizer: users.find((user) => user.id === event.organizerId)
      ? publicUser(users.find((user) => user.id === event.organizerId)!)
      : null,
  });

  const matchesEventWhere = (
    event: EventRecord,
    where: Record<string, any>,
  ) => {
    if (where.status && event.status !== where.status) return false;
    if (where.organizerId && event.organizerId !== where.organizerId) {
      return false;
    }
    if (where.OR?.length) {
      const search =
        where.OR[0]?.title?.contains || where.OR[1]?.description?.contains;
      if (
        search &&
        !event.title.includes(search) &&
        !event.description.includes(search)
      ) {
        return false;
      }
    }

    return true;
  };

  return {
    user: {
      findUnique: jest.fn(({ where }) => {
        if (where.email) {
          return users.find((user) => user.email === where.email) ?? null;
        }
        if (where.id) {
          return users.find((user) => user.id === where.id) ?? null;
        }

        return null;
      }),
      create: jest.fn(({ data, select }) => {
        const now = new Date();
        const user: UserRecord = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        users.push(user);

        if (select) {
          return publicUser(user);
        }

        return user;
      }),
    },
    event: {
      findFirst: jest.fn(({ where }) => {
        if (where.externalId) {
          return (
            events.find((event) => event.externalId === where.externalId) ??
            null
          );
        }

        return null;
      }),
      findUnique: jest.fn(({ where, include }) => {
        const event = events.find((item) => item.id === where.id) ?? null;
        if (!event) return null;

        return include?.organizer ? eventWithOrganizer(event) : event;
      }),
      findMany: jest.fn(({ where = {}, skip = 0, take, include }) => {
        const result = events
          .filter((event) => matchesEventWhere(event, where))
          .sort((left, right) => left.date.getTime() - right.date.getTime())
          .slice(skip, take ? skip + take : undefined);

        return include?.organizer ? result.map(eventWithOrganizer) : result;
      }),
      count: jest.fn(({ where = {} }) => {
        return events.filter((event) => matchesEventWhere(event, where)).length;
      }),
      create: jest.fn(({ data }) => {
        const now = new Date();
        const event: EventRecord = {
          id: randomUUID(),
          externalId: null,
          imageUrl: null,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        events.push(event);

        return event;
      }),
      update: jest.fn(({ where, data }) => {
        const index = events.findIndex((event) => event.id === where.id);
        if (index === -1) return null;

        events[index] = {
          ...events[index],
          ...data,
          updatedAt: new Date(),
        };

        return events[index];
      }),
      delete: jest.fn(({ where }) => {
        const index = events.findIndex((event) => event.id === where.id);
        const [deleted] = events.splice(index, 1);

        return deleted;
      }),
    },
  };
};

const companyPayload = (suffix: string) => ({
  name: `Empresa ${suffix}`,
  email: `empresa-${suffix.toLowerCase()}@vivae.test`,
  password: 'senha-segura-123',
  role: 'ORGANIZER',
});

const eventPayload = (suffix = 'Principal') => ({
  title: `Evento ${suffix}`,
  description: `Descricao do Evento ${suffix}`,
  category: 'Music',
  date: '2027-03-15T21:00:00.000Z',
  location: 'Sao Paulo, SP',
  capacity: 100,
  price: 120,
});

describe('Empresa / Eventos (e2e)', () => {
  let app: INestApplication<App>;

  const registerCompany = async (suffix: string) => {
    const payload = companyPayload(suffix);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    return payload;
  };

  const loginCompany = async (suffix: string) => {
    const company = await registerCompany(suffix);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: company.email, password: company.password })
      .expect(201);

    return response.body;
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Autenticacao: empresa faz login', async () => {
    const session = await loginCompany('Login');

    expect(session.accessToken).toEqual(expect.any(String));
    expect(session.user).toMatchObject({
      name: 'Empresa Login',
      email: 'empresa-login@vivae.test',
      role: 'ORGANIZER',
    });
  });

  it('Autorizacao: Empresa A nao acessa dados da Empresa B', async () => {
    const empresaA = await loginCompany('A');
    const empresaB = await loginCompany('B');

    const eventFromB = await request(app.getHttpServer())
      .post('/events')
      .set('x-organizer-id', empresaB.user.id)
      .send(eventPayload('Empresa B'))
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/events/${eventFromB.body.id}`)
      .set('x-organizer-id', empresaA.user.id)
      .send({ title: 'Tentativa indevida da Empresa A' })
      .expect(403);
  });

  it('Operacao: empresa cria, consulta e atualiza recurso', async () => {
    const empresa = await loginCompany('Operacao');

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('x-organizer-id', empresa.user.id)
      .send(eventPayload('Operacao'))
      .expect(201);

    await request(app.getHttpServer())
      .get(`/events/${created.body.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: created.body.id,
          title: 'Evento Operacao',
          organizerId: empresa.user.id,
          status: 'DRAFT',
        });
      });

    await request(app.getHttpServer())
      .patch(`/events/${created.body.id}`)
      .set('x-organizer-id', empresa.user.id)
      .send({ title: 'Evento Operacao Atualizado', price: 150 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: created.body.id,
          title: 'Evento Operacao Atualizado',
          price: 150,
        });
      });
  });

  it('Fluxo completo: login, operacao, consulta e resultado', async () => {
    const empresa = await loginCompany('Fluxo');

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${empresa.accessToken}`)
      .set('x-organizer-id', empresa.user.id)
      .send(eventPayload('Fluxo Completo'))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/events/${created.body.id}/publish`)
      .set('Authorization', `Bearer ${empresa.accessToken}`)
      .set('x-organizer-id', empresa.user.id)
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('PUBLISHED');
      });

    await request(app.getHttpServer())
      .get('/events')
      .query({ search: 'Fluxo Completo' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta.total).toBe(1);
        expect(body.data[0]).toMatchObject({
          id: created.body.id,
          title: 'Evento Fluxo Completo',
          status: 'PUBLISHED',
          organizerId: empresa.user.id,
        });
      });
  });
});
