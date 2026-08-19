import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsFilterDto } from './dto/events-filter.dto';

const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  SOLD_OUT: 'SOLD_OUT',
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: EventsFilterDto) {
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '12', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      status: EVENT_STATUS.PUBLISHED,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.category) {
      where.category = { contains: filters.category };
    }

    if (filters.city) {
      where.location = { contains: filters.city };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {
        ...(filters.minPrice ? { gte: parseFloat(filters.minPrice) } : {}),
        ...(filters.maxPrice ? { lte: parseFloat(filters.maxPrice) } : {}),
      };
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          organizer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Evento "${id}" não encontrado`);
    }

    return event;
  }

  async create(dto: CreateEventDto, organizerId: string) {
    if (dto.externalId) {
      const existing = await this.prisma.event.findFirst({
        where: { externalId: dto.externalId },
      });
      if (existing) {
        throw new ConflictException(
          `Já existe um evento com o externalId "${dto.externalId}"`,
        );
      }
    }

    return this.prisma.event.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        availableTickets: dto.capacity,
        organizerId,
        status: EVENT_STATUS.DRAFT,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto, organizerId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este evento',
      );
    }

    if (event.status === EVENT_STATUS.CANCELLED) {
      throw new BadRequestException(
        'Não é possível editar um evento cancelado',
      );
    }

    const updateData: Prisma.EventUpdateInput = { ...dto };
    if (dto.date) updateData.date = new Date(dto.date);

    return this.prisma.event.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, organizerId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este evento',
      );
    }

    if (event.status === EVENT_STATUS.PUBLISHED) {
      throw new BadRequestException('Cancele o evento antes de excluí-lo');
    }

    return this.prisma.event.delete({ where: { id } });
  }

  async publish(id: string, organizerId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'Você não tem permissão para publicar este evento',
      );
    }

    if (event.status !== EVENT_STATUS.DRAFT) {
      throw new BadRequestException(
        `Apenas eventos em DRAFT podem ser publicados. Status atual: ${event.status}`,
      );
    }

    if (
      !event.title ||
      !event.date ||
      !event.location ||
      !event.capacity ||
      !event.price
    ) {
      throw new BadRequestException(
        'Preencha todos os campos obrigatórios antes de publicar',
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: EVENT_STATUS.PUBLISHED },
    });
  }

  async cancel(id: string, organizerId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'Você não tem permissão para cancelar este evento',
      );
    }

    if (event.status === EVENT_STATUS.CANCELLED) {
      throw new BadRequestException('Este evento já está cancelado');
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: EVENT_STATUS.CANCELLED },
    });
  }

  async findByOrganizer(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
