// app/eventos/[id]/comprar/erro/page.tsx
import Link from "next/link";
import { XCircle } from "lucide-react";
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

export default async function CheckoutErrorPage({ searchParams }: PageProps) {
    const params = (await searchParams) || {};
    const reservationId = readParam(params, "reservationId");
    const reservation = reservationId ? await getReservation(reservationId) : null;
    const eventHref = reservation ? `/eventos/${reservation.event.id}` : "/eventos";

    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-error/40 bg-surface p-6">
            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-error text-text">
                    <XCircle className="h-6 w-6" />
                </span>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-text">Pagamento recusado</h1>
                    <p className="text-sm text-muted-foreground">
                        A reserva foi encerrada e os ingressos voltaram para o estoque.
                    </p>
                </div>
            </div>

            {reservation && (
                <div className="rounded-md bg-background p-4 text-sm">
                    <p className="font-bold text-text">{reservation.event.title}</p>
                    <p className="mt-1 text-muted-foreground">Status da reserva: {reservation.status}</p>
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                    href={`/eventos/${reservation?.event.id || ""}/comprar`}
                    className="flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-black text-background transition-colors hover:bg-accent/90"
                >
                    Tentar novamente
                </Link>
                <Link
                    href="/eventos"
                    className="flex h-11 items-center justify-center rounded-md border border-surface-2 px-4 text-sm font-bold text-text transition-colors hover:bg-surface-2"
                >
                    Ver eventos
                </Link>
            </div>
        </section>
    );
}