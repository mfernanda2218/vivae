export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "SOLD_OUT";

export interface EventOrganizer {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  externalId?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  category: string;
  date: string;
  location: string;
  capacity?: number;
  availableTickets: number;
  price: number;
  status: EventStatus;
  organizer?: EventOrganizer;
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number | string;
  limit?: number | string;
}

export interface CatalogEvent {
  id: string;
  externalId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
  location: string;
}
