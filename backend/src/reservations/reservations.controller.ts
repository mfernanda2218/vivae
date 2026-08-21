import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria reserva com baixa transacional de estoque' })
  create(
    @Body() dto: CreateReservationDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.reservationsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista reservas do cliente' })
  findAll(@Headers('x-user-id') userId?: string) {
    return this.reservationsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma reserva do cliente' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.reservationsService.findOne(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancela reserva e devolve estoque quando aplicável',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.reservationsService.cancel(id, userId);
  }
}
