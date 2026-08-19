import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { TicketmasterProvider } from './providers/ticketmaster.provider';

@Module({
  imports: [HttpModule],
  controllers: [CatalogController],
  providers: [CatalogService, TicketmasterProvider],
  exports: [CatalogService],
})
export class CatalogModule {}
