import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getPublicTicket } from "@/lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PublicTicketPage({ params }: PageProps) {
  const { token } = await params;
  const ticket = await getPublicTicket(token);

  if (!ticket) {
    notFound();
  }

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 rounded-lg border border-surface-2 bg-surface p-6 sm:grid-cols-[1fr_220px]">
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-xs font-black uppercase text-accent">{ticket.event.category}</span>
          <h1 className="mt-1 text-3xl font-black text-text">{ticket.event.title}</h1>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            {formatDate(ticket.event.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {ticket.event.location}
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
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-white p-3">
        <img
          src={ticket.qrCodeDataUrl}
          alt={`QR Code do ingresso ${ticket.code}`}
          className="h-44 w-44"
        />
        <span className="text-center text-xs font-bold text-background">{ticket.code}</span>
      </div>
    </section>
  );
}
