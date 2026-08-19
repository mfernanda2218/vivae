import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('events')
  @ApiOperation({ summary: 'Buscar eventos externos na Ticketmaster' })
  searchEvents(@Query() query: CatalogQueryDto) {
    return this.catalogService.searchEvents(query);
  }

  @Get('events/:externalId')
  @ApiOperation({ summary: 'Detalhes de um evento externo pelo externalId' })
  getEvent(@Param('externalId') externalId: string) {
    return this.catalogService.getEventByExternalId(externalId);
  }
}
