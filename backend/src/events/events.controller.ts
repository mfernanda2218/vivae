import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsFilterDto } from './dto/events-filter.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get()
  @ApiOperation({ summary: 'Lista eventos publicados com filtros' })
  findAll(@Query() filters: EventsFilterDto) {
    return this.eventsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um evento' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria evento em DRAFT' })
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.eventsService.create(dto, organizerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edita evento do organizador' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.eventsService.update(id, dto, organizerId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exclui evento do organizador' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.eventsService.remove(id, organizerId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publica evento em DRAFT' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.eventsService.publish(id, organizerId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancela evento do organizador' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.eventsService.cancel(id, organizerId);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Lista assentos disponíveis para um evento' })
  getAvailableSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.getAvailableSeats(id);
  }
}
