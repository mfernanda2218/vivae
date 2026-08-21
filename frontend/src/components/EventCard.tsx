import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import type { Event } from "@/types/event";

function formatDate(value: string) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function EventCard({ event }: { event: Event }) {
  const date = formatDate(event.date);

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded-lg border border-surface-2 bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/5"
    >
      <div className="aspect-[16/10] bg-surface-2">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            VIVAE
          </div>
        )}
      </div>
      <div className="grid flex-1 grid-cols-[56px_1fr] gap-4 p-4">
        <div className="flex h-16 flex-col items-center justify-center rounded-md bg-background text-center">
          <span className="text-lg font-black text-accent">{date.day}</span>
          <span className="text-xs font-bold uppercase text-muted-foreground">{date.month}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <span className="w-fit rounded-md bg-surface-2 px-2 py-1 text-xs font-bold text-muted-foreground">
            {event.category}
          </span>
          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-text">{event.title}</h2>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="line-clamp-1">{event.location}</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
            {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.date))}
          </span>
          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-text">
              A partir de {formatCurrency(event.price)}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-background transition-transform duration-200 group-hover:scale-105">
              <Ticket className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
