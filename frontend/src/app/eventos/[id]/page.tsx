// app/eventos/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket, UserRound } from "lucide-react";
import { getEvent } from "@/lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ id: string }>;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default async function EventDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    return (
        <article className="pb-24 lg:pb-0">
            <div className="overflow-hidden rounded-lg border border-surface-2 bg-surface">
                <div className="aspect-[16/7] min-h-[280px] bg-surface-2">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-lg font-black tracking-[0.18em] text-muted-foreground">
                            VIVAE
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                <section className="flex min-w-0 flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <span className="w-fit rounded-md bg-accent px-3 py-1 text-xs font-black uppercase text-background">
                            {event.category}
                        </span>
                        <h1 className="text-3xl font-black leading-tight text-text sm:text-5xl">
                            {event.title}
                        </h1>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg border border-surface-2 bg-surface p-4">
                            <CalendarDays className="h-5 w-5 shrink-0 text-accent" />
                            <span className="text-sm text-text">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-surface-2 bg-surface p-4">
                            <MapPin className="h-5 w-5 shrink-0 text-accent" />
                            <span className="text-sm text-text">{event.location}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h2 className="text-xl font-bold text-text">Descrição</h2>
                        <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">
                            {event.description}
                        </p>
                    </div>
                </section>

                <aside className="hidden h-fit rounded-lg border border-surface-2 bg-surface p-5 lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-5">
                    <PurchaseBox event={event} />
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 border-t border-surface-2 bg-surface p-4 lg:hidden">
                <PurchaseBox event={event} compact />
            </div>
        </article>
    );
}

function PurchaseBox({
    event,
    compact = false,
}: {
    event: NonNullable<Awaited<ReturnType<typeof getEvent>>>;
    compact?: boolean;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("vivae_token");
        const userData = localStorage.getItem("vivae_user");

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const href = isAuthenticated
        ? `/eventos/${event.id}/comprar`
        : "/login?redirect=/eventos/" + event.id + "/comprar";

    return (
        <div className={compact ? "flex items-center justify-between gap-4" : "flex flex-col gap-5"}>
            <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">A partir de</span>
                <strong className="text-2xl font-black text-text">{formatCurrency(event.price)}</strong>
                {!compact && (
                    <>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Ticket className="h-4 w-4 text-accent" />
                            {event.availableTickets} ingressos restantes
                        </span>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserRound className="h-4 w-4 text-accent" />
                            {event.organizer?.name || "Organizador Vivae"}
                        </span>
                    </>
                )}
            </div>
            <Link
                href={href}
                className="rounded-md bg-accent px-5 py-3 text-center text-sm font-bold text-background transition-colors hover:bg-accent/90"
            >
                {isAuthenticated ? "Comprar ingresso" : "Entrar para comprar"}
            </Link>
        </div>
    );
}