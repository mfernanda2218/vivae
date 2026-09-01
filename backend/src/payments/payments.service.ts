import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

const EVENT_STATUS = {
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
} as const;

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
} as const;

const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async process(
    reservationId: string,
    dto: ProcessPaymentDto,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { event: true, payment: true, tickets: true },
      });

      if (!reservation) {
        throw new NotFoundException('Reserva não encontrada');
      }

      if (reservation.userId !== userId) {
        throw new ForbiddenException('Reserva pertence a outro usuário');
      }

      if (!reservation.payment) {
        throw new BadRequestException('Reserva não possui pagamento');
      }

      if (reservation.payment.status === PAYMENT_STATUS.APPROVED) {
        throw new BadRequestException('Pagamento já aprovado');
      }

      if (reservation.status !== RESERVATION_STATUS.PENDING) {
        throw new BadRequestException('Reserva não está pendente de pagamento');
      }

      if (reservation.expiresAt < new Date()) {
        await this.returnStock(tx, reservation.eventId, reservation.quantity);
        await tx.payment.update({
          where: { reservationId },
          data: {
            status: PAYMENT_STATUS.DECLINED,
            method: dto.method || 'CARD',
          },
        });

        const expired = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: RESERVATION_STATUS.EXPIRED },
          include: this.paymentResultInclude(),
        });
        this.logger.warn({
          action: 'payment.expired',
          reservationId,
          userId: userId,
        });

        return expired;
      }

      if (dto.outcome === PAYMENT_STATUS.DECLINED) {
        await this.returnStock(tx, reservation.eventId, reservation.quantity);
        await tx.payment.update({
          where: { reservationId },
          data: {
            status: PAYMENT_STATUS.DECLINED,
            method: dto.method || 'CARD',
          },
        });

        const declined = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: RESERVATION_STATUS.DECLINED },
          include: this.paymentResultInclude(),
        });
        this.logger.warn({
          action: 'payment.declined',
          reservationId,
          userId: userId,
        });

        return declined;
      }

      await tx.payment.update({
        where: { reservationId },
        data: { status: PAYMENT_STATUS.APPROVED, method: dto.method || 'CARD' },
      });

      const tickets =
        reservation.tickets.length > 0
          ? reservation.tickets
          : await this.createTickets(tx, reservationId, reservation.quantity);

      const confirmed = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: RESERVATION_STATUS.CONFIRMED },
        include: this.paymentResultInclude(),
      });
      this.logger.log({
        action: 'payment.approved',
        reservationId,
        userId: userId,
        tickets: tickets.length,
      });

      return {
        ...confirmed,
        issuedTickets: tickets.length,
      };
    });
  }

  private async createTickets(
    tx: Prisma.TransactionClient,
    reservationId: string,
    quantity: number,
  ) {
    const tickets: Ticket[] = [];

    for (let index = 0; index < quantity; index += 1) {
      const qrToken = this.generateQrToken();
      tickets.push(
        await tx.ticket.create({
          data: {
            reservationId,
            code: this.generateTicketCode(),
            qrToken,
            qrTokenHash: this.hashToken(qrToken),
            status: 'ACTIVE',
          },
        }),
      );
    }

    return tickets;
  }

  private generateQrToken(): string {
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    const signature = this.createQrSignature(timestamp, random);
    return `${timestamp}.${random}.${signature}`;
  }

  private createQrSignature(timestamp: number, random: string): string {
    const secret = process.env.JWT_SECRET || 'vivae-dev-secret';
    const payload = `${timestamp}:${random}`;
    return createHmac('sha256', secret).update(payload).digest('hex').substring(0, 16);
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

  private generateTicketCode() {
    return `VIVAE-${randomBytes(5).toString('hex').toUpperCase()}`;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private paymentResultInclude() {
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


}
