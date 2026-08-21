import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

const EVENT_STATUS = {
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
} as const;

const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReservationDto, userId?: string) {
    const currentUserId = await this.resolveUserId(userId);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const stockUpdate = await tx.event.updateMany({
        where: {
          id: dto.eventId,
          status: EVENT_STATUS.PUBLISHED,
          availableTickets: { gte: dto.quantity },
        },
        data: {
          availableTickets: { decrement: dto.quantity },
        },
      });

      if (stockUpdate.count === 0) {
        const event = await tx.event.findUnique({ where: { id: dto.eventId } });
        if (!event) {
          throw new NotFoundException('Evento não encontrado');
        }

        throw new ConflictException(
          event.availableTickets > 0
            ? 'Quantidade solicitada indisponível'
            : 'Evento esgotado',
        );
      }

      const event = await tx.event.findUniqueOrThrow({
        where: { id: dto.eventId },
      });

      if (event.availableTickets === 0) {
        await tx.event.update({
          where: { id: dto.eventId },
          data: { status: EVENT_STATUS.SOLD_OUT },
        });
      }

      const reservation = await tx.reservation.create({
        data: {
          userId: currentUserId,
          eventId: dto.eventId,
          quantity: dto.quantity,
          expiresAt,
          payment: {
            create: {
              amount: event.price * dto.quantity,
              method: 'PENDING',
              status: 'PENDING',
            },
          },
        },
        include: this.reservationInclude(),
      });
      this.logger.log({
        action: 'reservation.create',
        reservationId: reservation.id,
        eventId: dto.eventId,
        quantity: dto.quantity,
        userId: currentUserId,
      });

      return reservation;
    });
  }

  async findAll(userId?: string) {
    const currentUserId = await this.resolveUserId(userId);

    return this.prisma.reservation.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      include: this.reservationInclude(),
    });
  }

  async findOne(id: string, userId?: string) {
    const currentUserId = await this.resolveUserId(userId);
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: this.reservationInclude(),
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (reservation.userId !== currentUserId) {
      throw new ForbiddenException('Reserva pertence a outro usuário');
    }

    return reservation;
  }

  async cancel(id: string, userId?: string) {
    const currentUserId = await this.resolveUserId(userId);

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { event: true, payment: true, tickets: true },
      });

      if (!reservation) {
        throw new NotFoundException('Reserva não encontrada');
      }

      if (reservation.userId !== currentUserId) {
        throw new ForbiddenException('Reserva pertence a outro usuário');
      }

      if (
        [
          RESERVATION_STATUS.CANCELLED,
          RESERVATION_STATUS.DECLINED,
          RESERVATION_STATUS.EXPIRED,
        ].includes(reservation.status as never)
      ) {
        throw new BadRequestException('Reserva já está encerrada');
      }

      const ticketsToReturn = reservation.tickets.filter(
        (ticket) => ticket.status === 'ACTIVE',
      ).length;

      await tx.ticket.updateMany({
        where: { reservationId: id, status: { not: 'USED' } },
        data: { status: 'CANCELLED' },
      });

      await tx.payment.updateMany({
        where: { reservationId: id, status: 'PENDING' },
        data: { status: 'DECLINED' },
      });

      if (ticketsToReturn > 0 || reservation.tickets.length === 0) {
        await tx.event.update({
          where: { id: reservation.eventId },
          data: {
            availableTickets: {
              increment:
                reservation.tickets.length === 0
                  ? reservation.quantity
                  : ticketsToReturn,
            },
            status:
              reservation.event.status === EVENT_STATUS.SOLD_OUT
                ? EVENT_STATUS.PUBLISHED
                : reservation.event.status,
          },
        });
      }

      const cancelled = await tx.reservation.update({
        where: { id },
        data: { status: RESERVATION_STATUS.CANCELLED },
        include: this.reservationInclude(),
      });
      this.logger.warn({
        action: 'reservation.cancel',
        reservationId: id,
        userId: currentUserId,
      });

      return cancelled;
    });
  }

  private reservationInclude() {
    return {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          imageUrl: true,
          price: true,
          category: true,
        },
      },
      payment: true,
      tickets: {
        select: {
          id: true,
          code: true,
          status: true,
          createdAt: true,
        },
      },
    } satisfies Prisma.ReservationInclude;
  }

  private async resolveUserId(userId?: string) {
    if (userId) {
      return userId;
    }

    const demoUser = await this.prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!demoUser) {
      throw new BadRequestException('Informe o header x-user-id');
    }

    return demoUser.id;
  }
}
