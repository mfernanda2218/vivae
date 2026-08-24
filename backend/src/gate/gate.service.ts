// src/gate/gate.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { GateActionDto } from './dto/gate-action.dto';

const EVENT_STATUS = {
  CANCELLED: 'CANCELLED',
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
} as const;

const RESERVATION_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

const TICKET_STATUS = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
} as const;

@Injectable()
export class GateService {
  private readonly logger = new Logger(GateService.name);

  constructor(private readonly prisma: PrismaService) { }

  async validate(dto: GateActionDto, userId?: string) {
    // Verificar se usuário é portaria válida
    const gate = await this.verifyGateAccess(userId, dto.eventId);

    if (gate === null) {
      throw new ForbiddenException('Acesso negado');
    }

    const ticket = await this.findTicket(dto.identifier);

    if (!ticket) {
      return this.invalid('INVALID', 'Ingresso nao encontrado');
    }

    const statusResult = this.checkTicketStatus(ticket, dto.eventId);
    if (statusResult) {
      return statusResult;
    }

    const update = await this.prisma.ticket.updateMany({
      where: { id: ticket.id, status: TICKET_STATUS.ACTIVE },
      data: {
        status: TICKET_STATUS.USED,
        validatedAt: new Date(),
        validatedBy: userId || 'gate',
      },
    });

    if (update.count === 0) {
      const current = await this.prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: this.ticketInclude(),
      });

      return current
        ? this.checkTicketStatus(current, dto.eventId) ||
        this.invalid('INVALID', 'Ingresso nao pode ser validado')
        : this.invalid('INVALID', 'Ingresso nao encontrado');
    }

    const validated = await this.prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: this.ticketInclude(),
    });
    this.logger.log({
      action: 'gate.validate',
      ticketId: ticket.id,
      eventId: validated.reservation.eventId,
      userId: userId || 'gate',
      gateId: gate?.id || 'unknown',
    });

    return {
      result: 'VALID',
      valid: true,
      message: 'Entrada liberada',
      ticket: this.toGateTicket(validated),
    };
  }

  async cancel(dto: GateActionDto, userId?: string) {
    // Verificar se usuário é portaria válida
    const gate = await this.verifyGateAccess(userId, dto.eventId);

    if (gate === null) {
      throw new ForbiddenException('Acesso negado');
    }

    const ticket = await this.findTicket(dto.identifier);

    if (!ticket) {
      return this.invalid('INVALID', 'Ingresso nao encontrado');
    }

    if (dto.eventId && ticket.reservation.eventId !== dto.eventId) {
      return this.invalid(
        'WRONG_EVENT',
        'Ingresso pertence a outro evento',
        ticket,
      );
    }

    if (ticket.status === TICKET_STATUS.CANCELLED) {
      return this.invalid('CANCELLED', 'Ingresso ja esta cancelado', ticket);
    }

    if (ticket.status === TICKET_STATUS.USED) {
      return this.invalid(
        'ALREADY_USED',
        'Ingresso ja utilizado nao pode ser cancelado',
        ticket,
      );
    }

    if (ticket.status !== TICKET_STATUS.ACTIVE) {
      return this.invalid('INVALID', 'Ingresso nao pode ser cancelado', ticket);
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const update = await tx.ticket.updateMany({
        where: { id: ticket.id, status: TICKET_STATUS.ACTIVE },
        data: {
          status: TICKET_STATUS.CANCELLED,
          validatedBy: userId || ticket.validatedBy,
        },
      });

      if (update.count === 0) {
        throw new BadRequestException('Ingresso nao pode ser cancelado');
      }

      await this.returnStock(tx, ticket.reservation.eventId, 1);
      await this.cancelReservationIfAllTicketsClosed(tx, ticket.reservationId);

      return tx.ticket.findUniqueOrThrow({
        where: { id: ticket.id },
        include: this.ticketInclude(),
      });
    });
    this.logger.warn({
      action: 'gate.cancel',
      ticketId: ticket.id,
      eventId: cancelled.reservation.eventId,
      userId: userId || 'gate',
      gateId: gate?.id || 'unknown',
    });

    return {
      result: 'CANCELLED',
      valid: false,
      message: 'Ingresso cancelado e estoque devolvido',
      ticket: this.toGateTicket(cancelled),
    };
  }

  async dashboard(organizerId?: string, eventId?: string) {
    const currentOrganizerId = await this.resolveOrganizerId(organizerId);
    const eventWhere: Prisma.EventWhereInput = {
      organizerId: currentOrganizerId,
      ...(eventId ? { id: eventId } : {}),
    };
    const ticketWhere: Prisma.TicketWhereInput = {
      reservation: { event: eventWhere },
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [events, ticketGroups, checkinsToday, checkinsWeek, reservations, payments] =
      await Promise.all([
        this.prisma.event.findMany({
          where: eventWhere,
          orderBy: { date: 'asc' },
          include: {
            reservations: {
              include: {
                tickets: { select: { status: true } },
                payment: { select: { status: true, amount: true } },
              },
            },
          },
        }),
        this.prisma.ticket.groupBy({
          by: ['status'],
          where: ticketWhere,
          _count: { _all: true },
        }),
        this.prisma.ticket.count({
          where: {
            ...ticketWhere,
            status: TICKET_STATUS.USED,
            validatedAt: { gte: today },
          },
        }),
        this.prisma.ticket.count({
          where: {
            ...ticketWhere,
            status: TICKET_STATUS.USED,
            validatedAt: { gte: weekAgo },
          },
        }),
        this.prisma.reservation.count({
          where: {
            event: eventWhere,
            status: RESERVATION_STATUS.CONFIRMED,
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            reservation: { event: eventWhere },
            status: 'APPROVED',
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
      ]);

    const ticketsByStatus = ticketGroups.reduce<Record<string, number>>(
      (acc, item) => ({ ...acc, [item.status]: item._count._all }),
      {},
    );

    const totalRevenue = payments._sum.amount || 0;
    const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
    const totalSold = Object.values(ticketsByStatus).reduce((sum, count) => sum + count, 0);
    const conversionRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

    return {
      organizerId: currentOrganizerId,
      totals: {
        events: events.length,
        reservations,
        tickets: totalSold,
        active: ticketsByStatus.ACTIVE || 0,
        used: ticketsByStatus.USED || 0,
        cancelled: ticketsByStatus.CANCELLED || 0,
        checkinsToday,
        checkinsWeek,
        availableTickets: events.reduce(
          (sum, event) => sum + event.availableTickets,
          0,
        ),
        totalRevenue,
        totalCapacity,
        conversionRate,
      },
      events: events.map((event) => {
        const statuses = event.reservations
          .flatMap((reservation) => reservation.tickets)
          .reduce<Record<string, number>>(
            (acc, ticket) => ({
              ...acc,
              [ticket.status]: (acc[ticket.status] || 0) + 1,
            }),
            {},
          );

        const eventRevenue = event.reservations
          .filter((r) => r.payment?.status === 'APPROVED')
          .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

        const eventSold = (statuses.ACTIVE || 0) + (statuses.USED || 0);
        const eventConversion = event.capacity > 0 ? Math.round((eventSold / event.capacity) * 100) : 0;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          status: event.status,
          capacity: event.capacity,
          availableTickets: event.availableTickets,
          soldTickets: eventSold,
          usedTickets: statuses.USED || 0,
          cancelledTickets: statuses.CANCELLED || 0,
          revenue: eventRevenue,
          conversionRate: eventConversion,
        };
      }),
    };
  }

  private async verifyGateAccess(userId?: string, eventId?: string) {
    if (!userId) {
      return null;
    }

    const gate = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!gate || gate.role !== 'GATE') {
      return null;
    }

    // Get gate events using raw query to avoid Prisma Client type issues
    const gateEvents = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT e.id 
      FROM "Event" e
      JOIN "_GateEvents" ge ON e.id = ge."B"
      WHERE ge."A" = ${userId}
    `;

    // Se a portaria não tem eventos associados,
    // ela pode validar todos os eventos do organizador que a criou
    if (gateEvents.length === 0) {
      const organizerEvents = await this.prisma.event.findMany({
        where: {
          organizerId: (gate as any).createdById || '',
        },
        select: {
          id: true,
        },
      });

      if (organizerEvents.length > 0) {
        return gate;
      }

      return null;
    }

    // Se a portaria tem eventos associados,
    // verificar se o evento está na lista
    if (eventId) {
      const hasAccess = gateEvents.some(
        (gateEvent) => gateEvent.id === eventId,
      );

      if (!hasAccess) {
        return null;
      }
    }

    return gate;
  }

  private checkTicketStatus(ticket: GateTicket, expectedEventId?: string) {
    if (expectedEventId && ticket.reservation.eventId !== expectedEventId) {
      return this.invalid(
        'WRONG_EVENT',
        'Ingresso pertence a outro evento',
        ticket,
      );
    }

    if (ticket.reservation.event.status === EVENT_STATUS.CANCELLED) {
      return this.invalid('EVENT_CANCELLED', 'Evento cancelado', ticket);
    }

    if (
      [
        RESERVATION_STATUS.CANCELLED,
        RESERVATION_STATUS.DECLINED,
        RESERVATION_STATUS.EXPIRED,
      ].includes(ticket.reservation.status as never) ||
      ticket.status === TICKET_STATUS.CANCELLED
    ) {
      return this.invalid('CANCELLED', 'Ingresso cancelado', ticket);
    }

    if (ticket.status === TICKET_STATUS.USED) {
      return this.invalid('ALREADY_USED', 'Ingresso ja utilizado', ticket);
    }

    if (
      ticket.status !== TICKET_STATUS.ACTIVE ||
      ticket.reservation.status !== RESERVATION_STATUS.CONFIRMED ||
      ticket.reservation.payment?.status !== 'APPROVED'
    ) {
      return this.invalid(
        'INVALID',
        'Ingresso ainda nao esta confirmado',
        ticket,
      );
    }

    return null;
  }

  private async findTicket(identifier: string) {
    const normalized = this.normalizeIdentifier(identifier);
    const upperCode = normalized.toUpperCase();
    const tokenHash = this.hashToken(normalized);

    return this.prisma.ticket.findFirst({
      where: {
        OR: [
          { id: normalized },
          { code: upperCode },
          { qrToken: normalized },
          { qrTokenHash: tokenHash },
        ],
      },
      include: this.ticketInclude(),
    });
  }

  private normalizeIdentifier(identifier: string) {
    const value = identifier.trim();

    try {
      const url = new URL(value);
      const parts = url.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || value).trim();
    } catch {
      const match = value.match(/ingresso\/([^/?#]+)/i);
      return decodeURIComponent(match?.[1] || value).trim();
    }
  }

  private invalid(result: string, message: string, ticket?: GateTicket) {
    return {
      result,
      valid: false,
      message,
      ticket: ticket ? this.toGateTicket(ticket) : null,
    };
  }

  private toGateTicket(ticket: GateTicket) {
    return {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      validatedAt: ticket.validatedAt,
      reservation: {
        id: ticket.reservation.id,
        status: ticket.reservation.status,
      },
      event: {
        id: ticket.reservation.event.id,
        title: ticket.reservation.event.title,
        date: ticket.reservation.event.date,
        location: ticket.reservation.event.location,
        status: ticket.reservation.event.status,
      },
      customer: {
        id: ticket.reservation.user.id,
        name: ticket.reservation.user.name,
        email: ticket.reservation.user.email,
      },
    };
  }

  private async returnStock(
    tx: Prisma.TransactionClient,
    eventId: string,
    quantity: number,
  ) {
    const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } });

    await tx.event.update({
      where: { id: eventId },
      data: {
        availableTickets: { increment: quantity },
        status:
          event.status === EVENT_STATUS.SOLD_OUT
            ? EVENT_STATUS.PUBLISHED
            : event.status,
      },
    });
  }

  private async cancelReservationIfAllTicketsClosed(
    tx: Prisma.TransactionClient,
    reservationId: string,
  ) {
    const remainingActive = await tx.ticket.count({
      where: {
        reservationId,
        status: { in: [TICKET_STATUS.ACTIVE, TICKET_STATUS.USED] },
      },
    });

    if (remainingActive === 0) {
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: RESERVATION_STATUS.CANCELLED },
      });
    }
  }

  private ticketInclude() {
    return {
      reservation: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: true,
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              status: true,
            },
          },
        },
      },
    } satisfies Prisma.TicketInclude;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async resolveOrganizerId(organizerId?: string) {
    if (organizerId) {
      return organizerId;
    }

    const demoOrganizer = await this.prisma.user.findFirst({
      where: { role: 'ORGANIZER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!demoOrganizer) {
      throw new NotFoundException('Organizador demo nao encontrado');
    }

    return demoOrganizer.id;
  }
}

type GateTicket = Prisma.TicketGetPayload<{
  include: ReturnType<GateService['ticketInclude']>;
}>;