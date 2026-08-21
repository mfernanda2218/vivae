import Link from "next/link";
import { Activity, CalendarDays, CheckCircle2, Ticket, XCircle } from "lucide-react";
import { getGateDashboard } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const dashboard = await getGateDashboard();

  if (!dashboard) {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-surface-2 bg-surface p-6">
        <h1 className="text-2xl font-black text-text">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Nao foi possivel carregar as metricas do organizador.
        </p>
      </section>
    );
  }

  const cards = [
    { label: "Eventos", value: dashboard.totals.events, icon: CalendarDays },
    { label: "Ingressos", value: dashboard.totals.tickets, icon: Ticket },
    { label: "Validados", value: dashboard.totals.used, icon: CheckCircle2 },
    { label: "Hoje", value: dashboard.totals.checkinsToday, icon: Activity },
    { label: "Cancelados", value: dashboard.totals.cancelled, icon: XCircle },
  ];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-black uppercase text-accent">Organizador</span>
          <h1 className="text-3xl font-black text-text">Dashboard</h1>
        </div>
        <Link
          href="/portaria"
          className="flex h-10 w-fit items-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-colors hover:bg-accent/90"
        >
          <Ticket className="h-4 w-4" />
          Abrir portaria
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-lg border border-surface-2 bg-surface p-4">
              <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Icon className="h-4 w-4 text-accent" />
                {card.label}
              </span>
              <strong className="mt-3 block text-3xl font-black text-text">{card.value}</strong>
            </article>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-2 bg-surface">
        <div className="border-b border-surface-2 p-4">
          <h2 className="text-lg font-black text-text">Eventos</h2>
        </div>
        <div className="divide-y divide-surface-2">
          {dashboard.events.map((event) => {
            const percent =
              event.soldTickets > 0 ? Math.round((event.usedTickets / event.soldTickets) * 100) : 0;

            return (
              <article
                key={event.id}
                className="grid gap-4 p-4 md:grid-cols-[1fr_160px_220px]"
              >
                <div className="min-w-0">
                  <h3 className="line-clamp-1 font-black text-text">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(event.date)} - {event.status}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-muted-foreground">
                    Vendidos <strong className="block text-text">{event.soldTickets}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Estoque <strong className="block text-text">{event.availableTickets}</strong>
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Check-in</span>
                    <strong className="text-text">{percent}%</strong>
                  </div>
                  <div className="h-2 rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
