"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";

const fallbackImages = [
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function Hero({ events }: { events: Event[] }) {
  const slides = useMemo(() => {
    if (events.length) return events;

    return [
      {
        id: "preview",
        title: "Descubra os próximos eventos",
        description: "Shows, festivais, teatro e esportes em um só lugar.",
        imageUrl: fallbackImages[0],
        category: "Destaque",
        date: new Date().toISOString(),
        location: "Brasil",
        availableTickets: 0,
        price: 0,
        status: "PUBLISHED" as const,
      },
    ];
  }, [events]);

  const [active, setActive] = useState(0);
  const event = slides[active];
  const imageUrl = event.imageUrl || fallbackImages[active % fallbackImages.length];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      className="relative aspect-[21/9] min-h-[360px] overflow-hidden rounded-lg border border-surface-2 bg-surface"
      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
      <div className="relative flex h-full max-w-2xl flex-col justify-end gap-5 p-6 sm:p-10">
        <span className="w-fit rounded-md bg-accent px-3 py-1 text-xs font-black uppercase tracking-wide text-background">
          {active === 0 ? "Destaque" : "Em breve"}
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-black leading-tight text-text sm:text-5xl">
            {event.title}
          </h1>
          <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            {event.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-text">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {event.location}
          </span>
        </div>
        <Link
          href={event.id === "preview" ? "/eventos" : `/eventos/${event.id}`}
          className="w-fit rounded-md bg-text px-5 py-3 text-sm font-bold text-background transition-colors hover:bg-accent"
        >
          Ver detalhes
        </Link>
      </div>
    </section>
  );
}
