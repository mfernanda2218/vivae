// lib/api.ts
import type {
  CatalogEvent,
  Event,
  EventFilters,
  EventsResponse,
  GateDashboard,
  GateResult,
  Reservation,
  TicketWithQr,
} from "@/types/event";

import type { LoginResponse, LoginRequest } from "@/types/auth";

import type { RegisterRequest, RegisterResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vivae.onrender.com";

function buildUrl(path: string, filters?: object) {
  const url = new URL(path, API_URL);

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getOrganizerId(): string | undefined {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('vivae_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'ORGANIZER' && user.id) {
          return user.id;
        }
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function getUserId(): string | undefined {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('vivae_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.id) {
          return user.id;
        }
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

async function apiFetch<T>(path: string, filters?: object): Promise<T> {
  const organizerId = getOrganizerId();
  const userId = getUserId();
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (organizerId) {
    headers['x-organizer-id'] = organizerId;
  }

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(buildUrl(path, filters), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function apiMutation<T>(path: string, body?: object): Promise<T> {
  const organizerId = getOrganizerId();
  const userId = getUserId();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (organizerId) {
    headers['x-organizer-id'] = organizerId;
  }

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || `API request failed with status ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json() as Promise<T>;
}

async function apiPost<T>(path: string, body?: object): Promise<T> {
  const organizerId = getOrganizerId();
  const userId = getUserId();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (organizerId) {
    headers['x-organizer-id'] = organizerId;
  }

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || `API request failed with status ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json() as Promise<T>;
}

async function apiFetchNoStore<T>(path: string, filters?: object): Promise<T> {
  const organizerId = getOrganizerId();
  const userId = getUserId();
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (organizerId) {
    headers['x-organizer-id'] = organizerId;
  }

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(buildUrl(path, filters), {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Falha ao criar conta');
  }

  return response.json();
}

export async function getEvents(filters?: EventFilters): Promise<EventsResponse> {
  try {
    return await apiFetch<EventsResponse>('/events', filters);
  } catch {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: Number(filters?.limit || 12), totalPages: 0 },
    };
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    return await apiFetch<Event>(`/events/${id}`);
  } catch {
    return null;
  }
}

export async function getCatalogEvents(query?: EventFilters) {
  try {
    return await apiFetch<{
      events: CatalogEvent[];
      total: number;
      page: number;
      totalPages: number;
    }>('/catalog/events', query);
  } catch {
    return { events: [], total: 0, page: 0, totalPages: 0 };
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Falha ao realizar login');
  }

  return response.json();
}

export async function createGateUser(data: {
  name: string;
  email: string;
  password: string;
  eventIds?: string[];
}): Promise<RegisterResponse> {
  const organizerId = getOrganizerId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (organizerId) {
    headers['x-organizer-id'] = organizerId;
  }

  const response = await fetch(`${API_URL}/users/gate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Falha ao criar portaria');
  }

  return response.json();
}

export async function createReservation(input: {
  eventId: string;
  quantity: number;
  seats?: string[];
}): Promise<Reservation> {
  return apiMutation<Reservation>('/reservations', input);
}

export async function processPayment(input: {
  reservationId: string;
  outcome: 'APPROVED' | 'DECLINED';
  method?: string;
}): Promise<Reservation> {
  return apiMutation<Reservation>(`/payments/${input.reservationId}`, {
    outcome: input.outcome,
    method: input.method || 'CARD',
  });
}

export async function getReservation(id: string): Promise<Reservation | null> {
  try {
    return await apiFetch<Reservation>(`/reservations/${id}`);
  } catch {
    return null;
  }
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return apiMutation<Reservation>(`/reservations/${id}/cancel`);
}

export async function getTickets(): Promise<TicketWithQr[]> {
  try {
    return await apiFetch<TicketWithQr[]>('/tickets');
  } catch {
    return [];
  }
}

export async function getPublicTicket(token: string): Promise<{
  id: string;
  code: string;
  status: string;
  qrCodeDataUrl: string;
  event: Reservation['event'];
  createdAt: string;
} | null> {
  try {
    return await apiFetch(`/tickets/public/${token}`);
  } catch {
    return null;
  }
}

export async function validateGateTicket(input: {
  identifier: string;
  eventId?: string;
}): Promise<GateResult> {
  return apiPost<GateResult>('/gate/validate', input);
}

export async function cancelGateTicket(input: {
  identifier: string;
  eventId?: string;
}): Promise<GateResult> {
  return apiPost<GateResult>('/gate/cancel', input);
}

export async function getGateDashboard(eventId?: string): Promise<GateDashboard | null> {
  try {
    return await apiFetchNoStore<GateDashboard>(
      '/gate/dashboard',
      eventId ? { eventId } : undefined,
    );
  } catch {
    return null;
  }
}