import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista ingressos do cliente com QR Code' })
  findAll(@CurrentUser('id') userId: string) {
    return this.ticketsService.findAll(userId);
  }

  @Get('public/:token')
  @ApiOperation({ summary: 'Visualização pública de ingresso por token' })
  findPublic(@Param('token') token: string) {
    return this.ticketsService.findPublicByToken(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha ingresso do cliente com QR Code' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ticketsService.findOne(id, userId);
  }

  @Get(':id/share')
  @ApiOperation({ summary: 'Retorna link compartilhável do ingresso' })
  share(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ticketsService.share(id, userId);
  }
}
