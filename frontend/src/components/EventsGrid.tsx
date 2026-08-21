import { SearchX } from "lucide-react";
import type { Event } from "@/types/event";
import { EmptyState } from "./EmptyState";
import { EventCard } from "./EventCard";

export function EventsGrid({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nenhum evento encontrado"
        description="Ajuste sua busca ou limpe os filtros para ver mais opcoes."
        actionLabel="Limpar filtros"
        actionHref="/eventos"
      />
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
