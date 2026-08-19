import Link from "next/link";
import type { Event } from "@/types/event";
import { EventCard } from "./EventCard";

export function EventsGrid({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-surface-2 bg-surface/40 p-8 text-center">
        <h2 className="text-xl font-bold text-text">Nenhum evento encontrado</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Ajuste sua busca ou limpe os filtros para ver mais opções.
        </p>
        <Link
          href="/"
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent/90"
        >
          Limpar filtros
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
