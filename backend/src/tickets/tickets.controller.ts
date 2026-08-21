import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista ingressos do cliente com QR Code' })
  findAll(@Headers('x-user-id') userId?: string) {
    return this.ticketsService.findAll(userId);
  }

  @Get('public/:token')
  @ApiOperation({ summary: 'Visualização pública de ingresso por token' })
  findPublic(@Param('token') token: string) {
    return this.ticketsService.findPublicByToken(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha ingresso do cliente com QR Code' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.ticketsService.findOne(id, userId);
  }

  @Get(':id/share')
  @ApiOperation({ summary: 'Retorna link compartilhável do ingresso' })
  share(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.ticketsService.share(id, userId);
  }
}
