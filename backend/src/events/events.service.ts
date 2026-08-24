import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
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
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) { }

  async findAll(filters: EventsFilterDto, organizerId?: string) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    // Se for um organizador, filtrar por organizerId
    // Se for um cliente, mostrar apenas eventos publicados
    const where: Prisma.EventWhereInput = organizerId
      ? { organizerId } // Organizador vê apenas seus eventos
      : { status: EVENT_STATUS.PUBLISHED }; // Cliente vê apenas eventos publicados

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
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
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      };
    }

    // Handle sorting
    let orderBy: Prisma.EventOrderByWithRelationInput = { date: 'asc' };
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date':
          orderBy = { date: 'asc' };
          break;
        case 'date-asc':
          orderBy = { date: 'asc' };
          break;
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'title':
          orderBy = { title: 'asc' };
          break;
        default:
          orderBy = { date: 'asc' };
      }
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        availableTickets: dto.capacity,
        organizerId,
        status: EVENT_STATUS.DRAFT,
      },
    });
    this.logger.log({ action: 'event.create', eventId: event.id, organizerId });

    return event;
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

    const updated = await this.prisma.event.update({
      where: { id },
      data: updateData,
    });
    this.logger.log({ action: 'event.update', eventId: id, organizerId });

    return updated;
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

    const deleted = await this.prisma.event.delete({ where: { id } });
    this.logger.log({ action: 'event.remove', eventId: id, organizerId });

    return deleted;
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

    const published = await this.prisma.event.update({
      where: { id },
      data: { status: EVENT_STATUS.PUBLISHED },
    });
    this.logger.log({ action: 'event.publish', eventId: id, organizerId });

    return published;
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

    const cancelled = await this.prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: {
          reservation: { eventId: id },
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        data: { status: 'CANCELLED' },
      });

      await tx.payment.updateMany({
        where: {
          reservation: {
            eventId: id,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          status: 'PENDING',
        },
        data: { status: 'DECLINED' },
      });

      await tx.reservation.updateMany({
        where: { eventId: id, status: { in: ['PENDING', 'CONFIRMED'] } },
        data: { status: 'CANCELLED' },
      });

      return tx.event.update({
        where: { id },
        data: {
          status: EVENT_STATUS.CANCELLED,
          availableTickets: 0,
        },
      });
    });
    this.logger.warn({ action: 'event.cancel', eventId: id, organizerId });

    return cancelled;
  }

  async findByOrganizer(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableSeats(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if ((event as any).seatType !== 'SEATED') {
      return {
        seatType: (event as any).seatType || 'GENERAL',
        seats: [],
      };
    }

    const rows = (event as any).rows || 0;
    const seatsPerRow = (event as any).seatsPerRow || 0;

    // Get all taken seats using raw query to avoid Prisma Client type issues
    const takenSeats = await this.prisma.$queryRaw<Array<{ seat_row: string; seat_number: string }>>`
      SELECT seat_row, seat_number
      FROM "Ticket"
      WHERE "reservationId" IN (
        SELECT id FROM "Reservation" WHERE "eventId" = ${eventId}
      )
      AND status != 'CANCELLED'
      AND seat_row IS NOT NULL
      AND seat_number IS NOT NULL
    `;

    const takenSeatSet = new Set(
      takenSeats.map((t) => `${t.seat_row}-${t.seat_number}`),
    );

    // Generate all possible seats and mark availability
    const seats: any[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${row}-${seat}`;
        seats.push({
          row: row.toString(),
          seat: seat.toString(),
          available: !takenSeatSet.has(seatId),
        });
      }
    }

    return {
      seatType: (event as any).seatType,
      rows,
      seatsPerRow,
      seats,
    };
  }
}
