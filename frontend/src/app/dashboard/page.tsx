// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  PackageOpen,
  Plus,
  Ticket,
  TicketX,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { getGateDashboard, createGateUser, getEvents } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { useToast } from "@/components/ToastProvider";
import type { Event, GateDashboard } from "@/types/event";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<GateDashboard | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateGate, setShowCreateGate] = useState(false);
  const [gateName, setGateName] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [isCreatingGate, setIsCreatingGate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, eventsData] = await Promise.all([
          getGateDashboard(),
          getEvents({ limit: 100 }),
        ]);
        setDashboard(dashboardData);
        setEvents(eventsData.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleCreateGate(event: React.FormEvent) {
    event.preventDefault();
    setIsCreatingGate(true);

    try {
      await createGateUser({
        name: gateName,
        email: gateEmail,
        password: gatePassword,
        eventIds: selectedEventIds,
      });

      showToast({
        title: "Portaria criada",
        description: `Usuário de portaria ${gateEmail} criado com sucesso!`,
        variant: "success",
      });

      setGateName("");
      setGateEmail("");
      setGatePassword("");
      setSelectedEventIds([]);
      setShowCreateGate(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar portaria";
      showToast({
        title: "Erro",
        description: message,
        variant: "error",
      });
    } finally {
      setIsCreatingGate(false);
    }
  }

  function toggleEventSelection(eventId: string) {
    setSelectedEventIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <ErrorState
        title="Dashboard indisponivel"
        description="Nao foi possivel carregar as metricas do organizador."
        action={
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-black text-background transition-colors hover:bg-accent/90"
          >
            Recarregar
          </button>
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
    { label: "Semana", value: dashboard.totals.checkinsWeek, icon: TrendingUp },
    { label: "Receita", value: formatCurrency(dashboard.totals.totalRevenue), icon: DollarSign },
    { label: "Conversão", value: `${dashboard.totals.conversionRate}%`, icon: TrendingUp },
  ];

  return (
    <RoleGuard allowedRoles={["ORGANIZER"]}>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-black uppercase text-accent">Organizador</span>
            <h1 className="text-3xl font-black text-text">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/portaria"
              className="flex h-10 w-fit items-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              <Ticket className="h-4 w-4" />
              Abrir portaria
            </Link>
            <button
              type="button"
              onClick={() => setShowCreateGate((current) => !current)}
              className="flex h-10 w-fit items-center gap-2 rounded-md border border-surface-2 px-4 text-sm font-bold text-text transition-colors hover:bg-surface-2"
            >
              <Plus className="h-4 w-4" />
              Criar portaria
            </button>
          </div>
        </div>

        {/* Formulário de criação de portaria */}
        {showCreateGate && (
          <div className="rounded-lg border border-surface-2 bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-text">
              <Users className="h-5 w-5 text-accent" />
              Criar usuário de portaria
            </h2>
            <form onSubmit={handleCreateGate} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                  Nome
                  <input
                    type="text"
                    value={gateName}
                    onChange={(event) => setGateName(event.target.value)}
                    placeholder="Nome da portaria"
                    required
                    className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                  Email
                  <input
                    type="email"
                    value={gateEmail}
                    onChange={(event) => setGateEmail(event.target.value)}
                    placeholder="portaria@evento.com"
                    required
                    className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-bold text-text">
                Senha
                <input
                  type="password"
                  value={gatePassword}
                  onChange={(event) => setGatePassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text">Eventos autorizados</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {events.map((event: Event) => (
                    <label
                      key={event.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${selectedEventIds.includes(event.id)
                          ? "border-accent bg-accent/10"
                          : "border-surface-2 hover:bg-surface-2"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="h-4 w-4 rounded border-surface-2 bg-background"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-bold text-text">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date)} - {event.location}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreatingGate}
                  className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-bold text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  {isCreatingGate ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isCreatingGate ? "Criando..." : "Criar portaria"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGate(false)}
                  className="flex h-10 items-center gap-2 rounded-md border border-surface-2 px-4 text-sm font-bold text-text transition-colors hover:bg-surface-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
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
                        <span className="text-muted-foreground">
                          Receita <strong className="block text-text">{formatCurrency(event.revenue)}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Conversão <strong className="block text-text">{event.conversionRate}%</strong>
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