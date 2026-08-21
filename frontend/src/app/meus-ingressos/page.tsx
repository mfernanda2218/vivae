import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getTickets } from "@/lib/api";
import { TicketActions } from "./TicketActions";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function MyTicketsPage() {
  const tickets = await getTickets();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text">Meus ingressos</h1>
        <p className="text-sm text-muted-foreground">
          {tickets.length} ingresso{tickets.length === 1 ? "" : "s"} confirmado
          {tickets.length === 1 ? "" : "s"}
        </p>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Nenhum ingresso por enquanto"
          description="Quando um pagamento for aprovado, seus QR Codes aparecem aqui."
          actionLabel="Encontrar eventos"
          actionHref="/eventos"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="grid gap-5 rounded-lg border border-surface-2 bg-surface p-5 sm:grid-cols-[1fr_176px]"
            >
              <div className="flex min-w-0 flex-col gap-4">
                <div>
                  <span className="text-xs font-black uppercase text-accent">
                    {ticket.reservation.event.category}
                  </span>
                  <h2 className="mt-1 line-clamp-2 text-xl font-black text-text">
                    {ticket.reservation.event.title}
                  </h2>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    {formatDate(ticket.reservation.event.date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    {ticket.reservation.event.location}
                  </span>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <span className="rounded-md bg-background px-3 py-2 text-muted-foreground">
                    Status <strong className="text-success">{ticket.status}</strong>
                  </span>
                  <span className="rounded-md bg-background px-3 py-2 text-muted-foreground">
                    Código <strong className="text-text">{ticket.code}</strong>
                  </span>
                </div>

                <TicketActions
                  reservationId={ticket.reservation.id}
                  shareUrl={ticket.shareUrl}
                  code={ticket.code}
                />
              </div>

              <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-white p-3">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR Code do ingresso ${ticket.code}`}
                  className="h-36 w-36"
                />
                <span className="text-center text-xs font-bold text-background">
                  {ticket.code}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
