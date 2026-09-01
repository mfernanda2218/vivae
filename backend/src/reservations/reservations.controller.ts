import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria reserva com baixa transacional de estoque' })
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista reservas do cliente' })
  findAll(@CurrentUser('id') userId: string) {
    return this.reservationsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma reserva do cliente' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.findOne(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancela reserva e devolve estoque quando aplicável',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancel(id, userId);
  }

  @Post('tickets/:ticketId/cancel')
  @ApiOperation({
    summary: 'Cancela ingresso individual preservando demais ingressos da reserva',
  })
  cancelTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancelTicket(ticketId, userId);
  }
}
