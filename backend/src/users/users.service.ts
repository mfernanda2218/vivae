// src/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGateDto } from './dto/create-gate.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) { }

  async findAll(actorId?: string) {
    await this.requireStaff(actorId);

    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.publicUserSelect(),
    });
  }

  async findOne(id: string, actorId?: string) {
    const actor = await this.resolveActor(actorId);
    this.ensureSelfOrStaff(actor, id);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.publicUserSelect(),
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  async findMe(actorId?: string) {
    if (!actorId) {
      throw new BadRequestException('Informe o header x-user-id');
    }

    return this.findOne(actorId, actorId);
  }

  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    const actor = await this.resolveActor(actorId);
    this.ensureSelfOrStaff(actor, id);

    if (dto.role && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem alterar roles');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      const emailOwner = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException('Email ja cadastrado');
      }

      data.email = email;
    }

    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: this.publicUserSelect(),
    });
    this.logger.log({ action: 'user.update', userId: id, actorId: actor.id });

    return updated;
  }

  async createGate(dto: CreateGateDto, organizerId?: string) {
    if (!organizerId) {
      throw new BadRequestException('Informe o header x-organizer-id');
    }

    const organizer = await this.prisma.user.findUnique({
      where: { id: organizerId },
      select: { id: true, role: true },
    });

    if (!organizer || organizer.role !== 'ORGANIZER') {
      throw new ForbiddenException('Apenas organizadores podem criar portaria');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email ja cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Use raw query to avoid Prisma Client type issues with createdById field
    const gateResult = await this.prisma.$queryRaw<Array<{ id: string; name: string; email: string; role: string }>>`
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdById", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${dto.name.trim()}, ${dto.email.toLowerCase().trim()}, ${passwordHash}, 'GATE', ${organizerId}, NOW(), NOW())
      RETURNING id, name, email, role
    `;

    const createdGate = gateResult[0] as { id: string; name: string; email: string; role: string };

    // Associar portaria a eventos específicos
    if (dto.eventIds?.length) {
      // Verificar se os eventos pertencem ao organizador
      const events = await this.prisma.event.findMany({
        where: {
          id: { in: dto.eventIds },
          organizerId,
        },
        select: { id: true },
      });

      if (events.length !== dto.eventIds.length) {
        throw new BadRequestException('Alguns eventos não pertencem a este organizador');
      }

      // Associar portaria aos eventos usando raw query
      for (const eventId of dto.eventIds) {
        await this.prisma.$queryRaw`
          INSERT INTO "_GateEvents" ("A", "B")
          VALUES (${createdGate.id}, ${eventId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    this.logger.log({
      action: 'user.createGate',
      gateId: createdGate.id,
      organizerId,
    });

    return createdGate;
  }

  async remove(id: string, actorId?: string) {
    const actor = await this.resolveActor(actorId);

    if (actor.role !== 'ADMIN' && actor.id !== id) {
      throw new ForbiddenException('Sem permissao para remover este usuario');
    }

    const [user, reservations, events] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id },
        select: this.publicUserSelect(),
      }),
      this.prisma.reservation.count({ where: { userId: id } }),
      this.prisma.event.count({ where: { organizerId: id } }),
    ]);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (reservations > 0 || events > 0) {
      throw new BadRequestException(
        'Usuario possui reservas ou eventos vinculados',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.warn({ action: 'user.remove', userId: id, actorId: actor.id });

    return user;
  }

  private async resolveActor(actorId?: string) {
    if (!actorId) {
      throw new BadRequestException('Informe o header x-user-id');
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, role: true },
    });

    if (!actor) {
      throw new ForbiddenException('Usuario autenticado invalido');
    }

    return actor;
  }

  private async requireStaff(actorId?: string) {
    const actor = await this.resolveActor(actorId);

    if (!['ADMIN', 'ORGANIZER', 'GATE'].includes(actor.role)) {
      throw new ForbiddenException('Sem permissao para listar usuarios');
    }

    return actor;
  }

  private ensureSelfOrStaff(actor: { id: string; role: string }, targetId: string) {
    if (actor.id === targetId) {
      return;
    }

    if (!['ADMIN', 'ORGANIZER', 'GATE'].includes(actor.role)) {
      throw new ForbiddenException('Sem permissao para acessar este usuario');
    }
  }

  private publicUserSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      createdById: true, // Adicionar este campo se necessário
    } as const;
  }
}