"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, Share2 } from "lucide-react";
import { cancelReservation } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type TicketActionsProps = {
  reservationId: string;
  shareUrl: string;
  code: string;
};

export function TicketActions({
  reservationId,
  shareUrl,
  code,
}: TicketActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  async function onCancel() {
    const confirmed = window.confirm(
      "Cancelar esta reserva? Os ingressos ativos serao cancelados e o estoque sera devolvido.",
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      await cancelReservation(reservationId);
      showToast({
        title: "Reserva cancelada",
        description: `O ingresso ${code} foi atualizado e o estoque voltou para venda.`,
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nao foi possivel cancelar a reserva.";
      showToast({
        title: "Falha ao cancelar",
        description: message,
        variant: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={shareUrl}
        className="flex h-10 items-center gap-2 rounded-md border border-surface-2 px-3 text-sm font-bold text-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-2"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar
      </a>
      <button
        type="button"
        onClick={onCancel}
        disabled={isCancelling}
        className="flex h-10 items-center gap-2 rounded-md border border-error/50 px-3 text-sm font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-50"
      >
        {isCancelling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Ban className="h-4 w-4" />
        )}
        {isCancelling ? "Cancelando" : "Cancelar"}
      </button>
    </div>
  );
}
