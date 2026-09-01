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
import { generateQrToken, hashToken } from '../common/qr.utils';

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

  async create(dto: CreateReservationDto, userId: string) {
    const currentUserId = userId;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException('Evento não encontrado');
      }

      // Validate seat selection for seated events
      if ((event as any).seatType === 'SEATED' && (!dto.seats || dto.seats.length !== dto.quantity)) {
        throw new BadRequestException('Para eventos com assentos numerados, selecione os assentos');
      }

      // Check if seats are already taken
      if (dto.seats && dto.seats.length > 0) {
        for (const seat of dto.seats) {
          const [row, number] = seat.split('-');
          const existingTicket = await tx.ticket.findFirst({
            where: {
              reservation: { eventId: dto.eventId },
              status: { not: 'CANCELLED' },
              seatRow: row,
              seatNumber: number,
            } as any,
          });

          if (existingTicket) {
            throw new ConflictException(`Assento já ocupado: ${row}-${number}`);
          }
        }
      }

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
        throw new ConflictException(
          event.availableTickets > 0
            ? 'Quantidade solicitada indisponível'
            : 'Evento esgotado',
        );
      }

      if (event.availableTickets === dto.quantity) {
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

      // Create tickets with seat assignments
      const tickets = await Promise.all(
        Array.from({ length: dto.quantity }).map(async (_, index) => {
          const seatAssignment = dto.seats?.[index]
            ? dto.seats[index].split('-')
            : null;

          return tx.ticket.create({
            data: {
              reservationId: reservation.id,
              code: this.generateTicketCode(),
              qrToken: this.generateQrToken(),
              qrTokenHash: this.hashToken(this.generateQrToken()),
              seatRow: seatAssignment?.[0] || null,
              seatNumber: seatAssignment?.[1] || null,
            } as any,
          });
        }),
      );

      this.logger.log({
        action: 'reservation.create',
        reservationId: reservation.id,
        eventId: dto.eventId,
        quantity: dto.quantity,
        userId: currentUserId,
        seats: dto.seats,
      });

      return { ...reservation, tickets };
    });
  }

  async findAll(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.reservationInclude(),
    });
  }

  async findOne(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: this.reservationInclude(),
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Reserva pertence a outro usuário');
    }

    return reservation;
  }

  async cancel(id: string, userId: string) {

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { event: true, payment: true, tickets: true },
      });

      if (!reservation) {
        throw new NotFoundException('Reserva não encontrada');
      }

      if (reservation.userId !== userId) {
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
        userId: userId,
      });

      return cancelled;
    });
  }

  async cancelTicket(ticketId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        include: {
          reservation: {
            include: { event: true, payment: true, tickets: true },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ingresso não encontrado');
      }

      if (ticket.reservation.userId !== userId) {
        throw new ForbiddenException('Ingresso pertence a outro usuário');
      }

      if (ticket.status !== 'ACTIVE') {
        throw new BadRequestException('Apenas ingressos ativos podem ser cancelados');
      }

      // Cancel individual ticket
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: 'CANCELLED' },
      });

      // Return one unit to stock
      await tx.event.update({
        where: { id: ticket.reservation.eventId },
        data: {
          availableTickets: { increment: 1 },
          status:
            ticket.reservation.event.status === EVENT_STATUS.SOLD_OUT
              ? EVENT_STATUS.PUBLISHED
              : ticket.reservation.event.status,
        },
      });

      // Check if all tickets in reservation are now closed
      const remainingActive = await tx.ticket.count({
        where: {
          reservationId: ticket.reservationId,
          status: { in: ['ACTIVE', 'USED'] },
        },
      });

      // Only cancel reservation if ALL tickets are closed
      if (remainingActive === 0) {
        await tx.reservation.update({
          where: { id: ticket.reservationId },
          data: { status: RESERVATION_STATUS.CANCELLED },
        });
      }

      this.logger.warn({
        action: 'ticket.cancel',
        ticketId: ticketId,
        reservationId: ticket.reservationId,
        userId: userId,
      });

      return {
        success: true,
        message: 'Ingresso cancelado individualmente',
        ticketId: ticketId,
        reservationStillActive: remainingActive > 0,
      };
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



  private generateTicketCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}-${random}`;
  }

}
