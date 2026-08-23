import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsFilterDto } from './dto/events-filter.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get()
  @ApiOperation({ summary: 'Lista eventos publicados com filtros' })
  findAll(
    @Query() filters: EventsFilterDto,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.findAll(filters, organizerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um evento' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria evento em DRAFT' })
  create(
    @Body() dto: CreateEventDto,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.create(dto, this.getOrganizerId(organizerId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita evento do organizador' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.update(id, dto, this.getOrganizerId(organizerId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui evento do organizador' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.remove(id, this.getOrganizerId(organizerId));
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publica evento em DRAFT' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.publish(id, this.getOrganizerId(organizerId));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancela evento do organizador' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.eventsService.cancel(id, this.getOrganizerId(organizerId));
  }

  private getOrganizerId(organizerId?: string) {
    if (!organizerId) {
      throw new BadRequestException('Informe o header x-organizer-id');
    }

    return organizerId;
  }
}
