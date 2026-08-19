import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface TicketmasterEvent {
  id: string;
  externalId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
  location: string;
}

interface TicketmasterImage {
  ratio?: string;
  width?: number;
  url?: string;
}

interface TicketmasterVenue {
  name?: string;
  city?: { name?: string };
  state?: { name?: string };
}

interface TicketmasterApiEvent {
  id?: string;
  name?: string;
  info?: string;
  pleaseNote?: string;
  description?: string;
  images?: TicketmasterImage[];
  classifications?: {
    segment?: { name?: string };
    genre?: { name?: string };
  }[];
  dates?: {
    start?: {
      dateTime?: string;
      localDate?: string;
    };
  };
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterApiEvent[];
  };
  page?: {
    totalElements?: number;
    number?: number;
    totalPages?: number;
  };
}

type HttpError = Error & {
  response?: {
    status?: number;
  };
};

@Injectable()
export class TicketmasterProvider {
  private readonly logger = new Logger(TicketmasterProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl =
      process.env.TICKETMASTER_BASE_URL ||
      'https://app.ticketmaster.com/discovery/v2';
    this.apiKey = process.env.TICKETMASTER_API_KEY || '';
  }

  async searchEvents(params: {
    keyword?: string;
    category?: string;
    city?: string;
    page?: string;
    size?: string;
  }): Promise<{
    events: TicketmasterEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'TICKETMASTER_API_KEY não está configurada',
      );
    }

    const query: Record<string, string> = {
      apikey: this.apiKey,
      locale: '*',
      countryCode: 'BR',
      size: params.size || '20',
      page: params.page || '0',
    };

    if (params.keyword) query.keyword = params.keyword;
    if (params.city) query.city = params.city;

    // Ticketmaster segment mapping
    const segmentMap: Record<string, string> = {
      music: 'KZFzniwnSyZfZ7v7nJ',
      shows: 'KZFzniwnSyZfZ7v7nJ',
      sports: 'KZFzniwnSyZfZ7v7nE',
      esportes: 'KZFzniwnSyZfZ7v7nE',
      arts: 'KZFzniwnSyZfZ7v7na',
      teatro: 'KZFzniwnSyZfZ7v7na',
      family: 'KZFzniwnSyZfZ7v7n1',
      infantil: 'KZFzniwnSyZfZ7v7n1',
      film: 'KZFzniwnSyZfZ7v7nn',
    };

    if (params.category && segmentMap[params.category.toLowerCase()]) {
      query.segmentId = segmentMap[params.category.toLowerCase()];
    }

    const searchParams = new URLSearchParams(query).toString();
    const url = `${this.baseUrl}/events.json?${searchParams}`;

    this.logger.debug(`Fetching Ticketmaster: ${url}`);

    const data = await this.fetchTicketmaster<TicketmasterSearchResponse>(url);

    const rawEvents = data?._embedded?.events ?? [];
    const page = data?.page ?? { totalElements: 0, number: 0, totalPages: 0 };

    const events = rawEvents.map((event) => this.normalizeEvent(event));

    return {
      events,
      total: page.totalElements ?? 0,
      page: page.number ?? 0,
      totalPages: page.totalPages ?? 0,
    };
  }

  async getEventById(externalId: string): Promise<TicketmasterEvent | null> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'TICKETMASTER_API_KEY não está configurada',
      );
    }

    const url = `${this.baseUrl}/events/${externalId}.json?apikey=${this.apiKey}`;
    this.logger.debug(`Fetching Ticketmaster event: ${url}`);

    const data = await this.fetchTicketmaster<TicketmasterApiEvent>(url);

    if (!data || !data.id) return null;
    return this.normalizeEvent(data);
  }

  private async fetchTicketmaster<T>(url: string): Promise<T | null> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url));
      return response.data;
    } catch (error: unknown) {
      const requestError = error as HttpError;

      if (requestError.response?.status === 404) {
        return null;
      }

      this.logger.error(
        `Ticketmaster request failed: ${requestError.message || 'unknown error'}`,
      );
      throw new BadGatewayException(
        'Não foi possível consultar a Ticketmaster agora',
      );
    }
  }

  private normalizeEvent(event: TicketmasterApiEvent): TicketmasterEvent {
    const imageUrl =
      event.images?.find(
        (image) => image.ratio === '16_9' && (image.width ?? 0) >= 1024,
      )
        ?.url ||
      event.images?.[0]?.url ||
      '';

    const category =
      event.classifications?.[0]?.segment?.name ||
      event.classifications?.[0]?.genre?.name ||
      'Outros';

    const venue = event._embedded?.venues?.[0];
    const city = venue?.city?.name || '';
    const stateName = venue?.state?.name || '';
    const venueName = venue?.name || '';
    const location = [venueName, city, stateName].filter(Boolean).join(', ');

    const date =
      event.dates?.start?.dateTime ||
      event.dates?.start?.localDate ||
      new Date().toISOString();

    const description =
      event.info ||
      event.pleaseNote ||
      event.description ||
      `Evento: ${event.name || 'sem título'}`;

    return {
      id: event.id || '',
      externalId: event.id || '',
      title: event.name || 'Evento sem título',
      description,
      imageUrl,
      category,
      date,
      location,
    };
  }
}
