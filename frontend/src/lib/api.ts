import type { CatalogEvent, Event, EventFilters, EventsResponse } from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function buildUrl(path: string, filters?: object) {
  const url = new URL(path, API_URL);

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function apiFetch<T>(path: string, filters?: object): Promise<T> {
  const response = await fetch(buildUrl(path, filters), {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getEvents(filters?: EventFilters): Promise<EventsResponse> {
  try {
    return await apiFetch<EventsResponse>("/events", filters);
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
    }>("/catalog/events", query);
  } catch {
    return { events: [], total: 0, page: 0, totalPages: 0 };
  }
}
