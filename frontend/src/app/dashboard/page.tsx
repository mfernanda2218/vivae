import Link from "next/link";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  PackageOpen,
  Ticket,
  TicketX,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { getGateDashboard } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";

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
      <ErrorState
        title="Dashboard indisponivel"
        description="Nao foi possivel carregar as metricas do organizador."
        action={
          <Link
            href="/dashboard"
            className="rounded-md bg-accent px-4 py-2 text-sm font-black text-background transition-colors hover:bg-accent/90"
          >
            Recarregar
          </Link>
        }
      />
    );
  }

  const occupancy =
    dashboard.totals.tickets + dashboard.totals.availableTickets > 0
      ? Math.round(
        (dashboard.totals.tickets /
          (dashboard.totals.tickets + dashboard.totals.availableTickets)) *
        100,
      )
      : 0;

  const cards = [
    { label: "Eventos", value: dashboard.totals.events, icon: CalendarDays },
    { label: "Ingressos", value: dashboard.totals.tickets, icon: Ticket },
    { label: "Ativos", value: dashboard.totals.active, icon: Ticket },
    { label: "Validados", value: dashboard.totals.used, icon: CheckCircle2 },
    { label: "Hoje", value: dashboard.totals.checkinsToday, icon: Activity },
    { label: "Cancelados", value: dashboard.totals.cancelled, icon: XCircle },
  ];

  return (
    <RoleGuard allowedRoles={["ORGANIZER"]}>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-black uppercase text-accent">Organizador</span>
            <h1 className="text-3xl font-black text-text">Dashboard</h1>
          </div>
          <Link
            href="/portaria"
            className="flex h-10 w-fit items-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
          >
            <Ticket className="h-4 w-4" />
            Abrir portaria
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-lg border border-surface-2 bg-surface p-4 transition-colors hover:border-accent/60"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Icon className="h-4 w-4 text-accent" />
                  {card.label}
                </span>
                <strong className="mt-3 block text-3xl font-black text-text">{card.value}</strong>
              </article>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-lg border border-surface-2 bg-surface">
            <div className="border-b border-surface-2 p-4">
              <h2 className="text-lg font-black text-text">Eventos</h2>
            </div>

            {dashboard.events.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={PackageOpen}
                  title="Nenhum evento cadastrado"
                  description="Assim que seus eventos forem criados, as vendas e check-ins aparecem aqui."
                  actionLabel="Ver catalogo"
                  actionHref="/eventos"
                />
              </div>
            ) : (
              <div className="divide-y divide-surface-2">
                {dashboard.events.map((event) => {
                  const percent =
                    event.soldTickets > 0
                      ? Math.round((event.usedTickets / event.soldTickets) * 100)
                      : 0;

                  return (
                    <article
                      key={event.id}
                      className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_160px_220px]"
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
                          Estoque{" "}
                          <strong className="block text-text">{event.availableTickets}</strong>
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Check-in</span>
                          <strong className="text-text">{percent}%</strong>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-2 rounded-full bg-accent transition-[width] duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="flex h-fit flex-col gap-4 rounded-lg border border-surface-2 bg-surface p-5 lg:sticky lg:top-28">
            <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <TicketX className="h-4 w-4 text-accent" />
              Ocupacao geral
            </span>
            <strong className="text-4xl font-black text-text">{occupancy}%</strong>
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-2 rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${occupancy}%` }}
              />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {dashboard.totals.availableTickets} ingressos ainda disponiveis no conjunto de eventos.
            </p>
          </aside>
        </div>
      </section>
    </RoleGuard>
  );
}
