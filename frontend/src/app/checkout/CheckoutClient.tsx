"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, Minus, Plus, XCircle } from "lucide-react";
import { createReservation, processPayment } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import type { Event } from "@/types/event";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function CheckoutClient({ event }: { event: Event }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const maxQuantity = Math.min(event.availableTickets, 10);
  const total = useMemo(() => event.price * quantity, [event.price, quantity]);
  const soldOut = maxQuantity <= 0;

  async function submitPayment(outcome: "APPROVED" | "DECLINED") {
    setError("");
    setIsSubmitting(true);

    try {
      showToast({
        title: "Reserva iniciada",
        description: "Estamos separando seus ingressos.",
      });

      const reservation = await createReservation({ eventId: event.id, quantity });
      const payment = await processPayment({
        reservationId: reservation.id,
        outcome,
        method: "CARD",
      });

      if (payment.status === "CONFIRMED") {
        showToast({
          title: "Pagamento aprovado",
          description: "Seus ingressos ja foram emitidos.",
          variant: "success",
        });
        router.push(`/checkout/sucesso?reservationId=${payment.id}`);
        return;
      }

      showToast({
        title: "Pagamento recusado",
        description: "A reserva foi encerrada e o estoque devolvido.",
        variant: "error",
      });
      router.push(`/checkout/erro?reservationId=${payment.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel finalizar a compra.";
      setError(message);
      showToast({
        title: "Erro no checkout",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex min-w-0 flex-col gap-5 rounded-lg border border-surface-2 bg-surface p-5">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase text-accent">{event.category}</span>
          <h1 className="text-2xl font-black text-text">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{event.location}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-surface-2">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-black tracking-[0.18em] text-muted-foreground">
                VIVAE
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-md bg-background p-4">
            <div>
              <h2 className="text-lg font-bold text-text">Quantidade</h2>
              <p className="text-sm text-muted-foreground">
                {event.availableTickets} ingresso{event.availableTickets === 1 ? "" : "s"} disponivel
                {event.availableTickets === 1 ? "" : "is"}
              </p>
            </div>
            <div className="flex h-12 w-fit items-center rounded-md border border-surface-2 bg-surface">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                disabled={quantity <= 1 || soldOut || isSubmitting}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-text disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-12 w-12 items-center justify-center text-base font-black text-text">
                {soldOut ? 0 : quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                disabled={quantity >= maxQuantity || soldOut || isSubmitting}
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-text disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-surface-2 bg-surface p-5 lg:sticky lg:top-28">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-black text-text">Resumo</h2>
            <p className="text-sm text-muted-foreground">Pagamento simulado para o desafio.</p>
          </div>

          <div className="flex flex-col gap-3 border-y border-surface-2 py-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Ingressos</span>
              <span className="font-bold text-text">
                {quantity} x {formatCurrency(event.price)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Taxas</span>
              <span className="font-bold text-success">{formatCurrency(0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-base">
              <span className="font-bold text-text">Total</span>
              <span className="font-black text-accent">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="rounded-md border border-surface-2 bg-background p-4">
            <span className="flex items-center gap-2 text-sm font-bold text-text">
              <CreditCard className="h-4 w-4 text-accent" />
              Cartao de credito
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Use os botoes abaixo para demonstrar os dois estados do PaymentModule.
            </p>
          </div>

          {error ? (
            <div className="rounded-md border border-error/40 bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              disabled={soldOut || isSubmitting}
              onClick={() => submitPayment("APPROVED")}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 disabled:translate-y-0 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isSubmitting ? "Processando" : "Pagar agora"}
            </button>
            <button
              type="button"
              disabled={soldOut || isSubmitting}
              onClick={() => submitPayment("DECLINED")}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-error/50 px-4 text-sm font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Simular recusa
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
