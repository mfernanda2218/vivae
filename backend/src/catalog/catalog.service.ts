import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketmasterProvider,
  TicketmasterEvent,
} from './providers/ticketmaster.provider';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly ticketmaster: TicketmasterProvider) {}

  async searchEvents(query: CatalogQueryDto) {
    return this.ticketmaster.searchEvents({
      keyword: query.keyword,
      category: query.category,
      city: query.city,
      page: query.page,
      size: query.size,
    });
  }

  async getEventByExternalId(externalId: string): Promise<TicketmasterEvent> {
    const event = await this.ticketmaster.getEventById(externalId);
    if (!event) {
      throw new NotFoundException(
        `Evento externo "${externalId}" não encontrado`,
      );
    }
    return event;
  }
}
