import Link from "next/link";
import { CheckCircle2, Ticket } from "lucide-react";
import { getReservation } from "@/lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const reservationId = readParam(params, "reservationId");
  const reservation = reservationId ? await getReservation(reservationId) : null;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-success/40 bg-surface p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-success text-background">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-text">Pagamento aprovado</h1>
          <p className="text-sm text-muted-foreground">
            Sua reserva foi confirmada e os ingressos já estão disponíveis.
          </p>
        </div>
      </div>

      {reservation && (
        <div className="rounded-md bg-background p-4 text-sm">
          <p className="font-bold text-text">{reservation.event.title}</p>
          <p className="mt-1 text-muted-foreground">
            {reservation.quantity} ingresso{reservation.quantity === 1 ? "" : "s"} emitido
            {reservation.quantity === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/meus-ingressos"
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-colors hover:bg-accent/90"
        >
          <Ticket className="h-4 w-4" />
          Ver meus ingressos
        </Link>
        <Link
          href="/eventos"
          className="flex h-11 items-center justify-center rounded-md border border-surface-2 px-4 text-sm font-bold text-text transition-colors hover:bg-surface-2"
        >
          Comprar outro evento
        </Link>
      </div>
    </section>
  );
}
