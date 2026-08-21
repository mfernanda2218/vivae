import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    const currentUserId = await this.resolveUserId(userId);
    const tickets = await this.prisma.ticket.findMany({
      where: {
        reservation: {
          userId: currentUserId,
          status: 'CONFIRMED',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: this.ticketInclude(),
    });

    return Promise.all(tickets.map((ticket) => this.toTicketResponse(ticket)));
  }

  async findOne(id: string, userId?: string) {
    const currentUserId = await this.resolveUserId(userId);
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.ticketInclude(),
    });

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado');
    }

    if (ticket.reservation.userId !== currentUserId) {
      throw new ForbiddenException('Ingresso pertence a outro usuário');
    }

    return this.toTicketResponse(ticket);
  }

  async share(id: string, userId?: string) {
    const ticket = await this.findOne(id, userId);

    return {
      ticketId: ticket.id,
      shareUrl: ticket.shareUrl,
      qrCodeDataUrl: ticket.qrCodeDataUrl,
    };
  }

  async findPublicByToken(token: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { qrToken: token },
      include: this.ticketInclude(),
    });

    if (!ticket || ticket.status !== 'ACTIVE') {
      throw new NotFoundException('Ingresso inválido');
    }

    const response = await this.toTicketResponse(ticket);

    return {
      id: response.id,
      code: response.code,
      status: response.status,
      qrCodeDataUrl: response.qrCodeDataUrl,
      event: response.reservation.event,
      createdAt: response.createdAt,
    };
  }

  private async toTicketResponse(ticket: TicketWithReservation) {
    const token = ticket.qrToken || ticket.code;
    const shareUrl = `${this.frontendUrl()}/ingresso/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0B0B0F',
        light: '#FFFFFF',
      },
    });

    return {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      createdAt: ticket.createdAt,
      shareUrl,
      qrPayload: shareUrl,
      qrCodeDataUrl,
      reservation: {
        id: ticket.reservation.id,
        quantity: ticket.reservation.quantity,
        status: ticket.reservation.status,
        event: ticket.reservation.event,
        payment: ticket.reservation.payment,
      },
    };
  }

  private ticketInclude() {
    return {
      reservation: {
        include: {
          payment: true,
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
        },
      },
    } as const;
  }

  private frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3001';
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

type TicketWithReservation = Awaited<
  ReturnType<PrismaService['ticket']['findFirst']>
> & {
  reservation: {
    id: string;
    userId: string;
    quantity: number;
    status: string;
    event: {
      id: string;
      title: string;
      date: Date;
      location: string;
      imageUrl: string | null;
      price: number;
      category: string;
    };
    payment: {
      id: string;
      reservationId: string;
      amount: number;
      status: string;
      method: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  };
};
