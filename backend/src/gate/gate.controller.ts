import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GateActionDto } from './dto/gate-action.dto';
import { GateService } from './gate.service';

@ApiTags('Gate')
@Controller('gate')
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Valida ingresso na portaria e previne segunda utilizacao',
  })
  validate(@Body() dto: GateActionDto, @Headers('x-user-id') userId?: string) {
    return this.gateService.validate(dto, userId);
  }

  @Post('cancel')
  @ApiOperation({
    summary: 'Cancela ingresso ativo e devolve uma unidade ao estoque',
  })
  cancel(@Body() dto: GateActionDto, @Headers('x-user-id') userId?: string) {
    return this.gateService.cancel(dto, userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Metricas basicas do organizador' })
  dashboard(
    @Headers('x-organizer-id') organizerId?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.gateService.dashboard(organizerId, eventId);
  }
}
