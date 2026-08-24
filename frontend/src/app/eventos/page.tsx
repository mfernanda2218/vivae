// app/eventos/page.tsx
import { Suspense } from "react";
import { EventsGrid } from "@/components/EventsGrid";
import { Filters } from "@/components/Filters";
import { getEvents } from "@/lib/api";
import type { EventFilters } from "@/types/event";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const filters: EventFilters = {
    search: readParam(params, "search"),
    category: readParam(params, "category"),
    city: readParam(params, "city"),
    dateFrom: readParam(params, "dateFrom"),
    dateTo: readParam(params, "dateTo"),
    minPrice: readParam(params, "minPrice"),
    maxPrice: readParam(params, "maxPrice"),
    page: readParam(params, "page") || 1,
    limit: 16,
  };

  const response = await getEvents(filters);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Suspense>
        <Filters />
      </Suspense>
      <section className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-text">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            {response.meta.total} evento{response.meta.total === 1 ? "" : "s"} encontrado{response.meta.total === 1 ? "" : "s"}
          </p>
        </div>
        <EventsGrid events={response.data} />
      </section>
    </div>
  );
}