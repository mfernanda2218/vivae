import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GateActionDto } from './dto/gate-action.dto';
import { GateService } from './gate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Gate')
@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  @Roles('GATE', 'ORGANIZER', 'ADMIN')
  @ApiOperation({
    summary: 'Valida ingresso na portaria e previne segunda utilizacao',
  })
  validate(@Body() dto: GateActionDto, @CurrentUser('id') userId: string) {
    return this.gateService.validate(dto, userId);
  }

  @Post('cancel')
  @Roles('GATE', 'ORGANIZER', 'ADMIN')
  @ApiOperation({
    summary: 'Cancela ingresso ativo e devolve uma unidade ao estoque',
  })
  cancel(@Body() dto: GateActionDto, @CurrentUser('id') userId: string) {
    return this.gateService.cancel(dto, userId);
  }

  @Get('dashboard')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Metricas basicas do organizador' })
  dashboard(
    @CurrentUser('id') organizerId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.gateService.dashboard(organizerId, eventId);
  }
}
