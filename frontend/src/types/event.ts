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

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "DECLINED"
  | "EXPIRED";

export type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED";

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
}

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  event: Pick<
    Event,
    "id" | "title" | "date" | "location" | "imageUrl" | "price" | "category"
  >;
  payment: Payment | null;
  tickets: Array<{
    id: string;
    code: string;
    status: string;
    createdAt: string;
  }>;
  issuedTickets?: number;
}

export interface TicketWithQr {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  shareUrl: string;
  qrPayload: string;
  qrCodeDataUrl: string;
  reservation: {
    id: string;
    quantity: number;
    status: ReservationStatus;
    event: Reservation["event"];
    payment: Payment | null;
  };
}
