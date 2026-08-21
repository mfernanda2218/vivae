import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    reservation: { count: jest.Mock };
    event: { count: jest.Mock };
  };

  const user = {
    id: 'user-id',
    name: 'Cliente Vivae',
    email: 'cliente@vivae.app',
    role: 'CUSTOMER',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const organizer = { id: 'organizer-id', role: 'ORGANIZER' };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      reservation: { count: jest.fn() },
      event: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('findAll lists public users for operational roles', async () => {
    prisma.user.findUnique.mockResolvedValue(organizer);
    prisma.user.findMany.mockResolvedValue([user]);

    await expect(service.findAll(organizer.id)).resolves.toEqual([user]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('findOne returns the public user when actor can access it', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(organizer)
      .mockResolvedValueOnce(user);

    await expect(service.findOne(user.id, organizer.id)).resolves.toEqual(user);
  });

  it('findMe reads the current user from x-user-id', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: user.id,
      role: user.role,
    });
    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findMe(user.id)).resolves.toEqual(user);
  });

  it('update normalizes email and hashes password', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: user.id,
      role: user.role,
    });
    prisma.user.findUnique.mockResolvedValueOnce({ id: user.id });
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.update.mockResolvedValue({
      ...user,
      email: 'novo@vivae.app',
    });

    await expect(
      service.update(
        user.id,
        {
          name: ' Novo Nome ',
          email: ' NOVO@VIVAE.APP ',
          password: 'nova-senha',
        },
        user.id,
      ),
    ).resolves.toMatchObject({ email: 'novo@vivae.app' });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Novo Nome',
          email: 'novo@vivae.app',
          passwordHash: expect.stringMatching(/^\$2[aby]\$/),
        }),
      }),
    );
    expect(prisma.user.update.mock.calls[0][0].data.passwordHash).not.toBe(
      'nova-senha',
    );
  });

  it('remove deletes users without reservations or events', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: user.id,
      role: user.role,
    });
    prisma.user.findUnique.mockResolvedValueOnce(user);
    prisma.reservation.count.mockResolvedValue(0);
    prisma.event.count.mockResolvedValue(0);
    prisma.user.delete.mockResolvedValue(user);

    await expect(service.remove(user.id, user.id)).resolves.toEqual(user);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: user.id } });
  });
});
