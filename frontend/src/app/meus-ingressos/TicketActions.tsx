// components/TicketActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Download, Loader2, Share2 } from "lucide-react";
import { cancelReservation, cancelTicket } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type TicketActionsProps = {
  reservationId: string;
  ticketId: string;
  shareUrl: string;
  code: string;
  qrCodeDataUrl: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
};

export function TicketActions({
  reservationId,
  ticketId,
  shareUrl,
  code,
  qrCodeDataUrl,
  eventTitle,
  eventDate,
  eventLocation,
}: TicketActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      // Criar canvas para gerar imagem do ticket
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Não foi possível criar o canvas");
      }

      // Fundo
      ctx.fillStyle = "#141419";
      ctx.fillRect(0, 0, 400, 600);

      // Borda
      ctx.strokeStyle = "#A3E635";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 380, 580);

      // Logo
      ctx.fillStyle = "#A3E635";
      ctx.font = "bold 32px Arial";
      ctx.fillText("VIVAE", 30, 50);

      // Título do evento
      ctx.fillStyle = "#F5F5F5";
      ctx.font = "bold 20px Arial";
      ctx.fillText(eventTitle.substring(0, 25), 30, 100);

      // Informações do evento
      ctx.font = "14px Arial";
      ctx.fillText(eventDate, 30, 140);
      ctx.fillText(eventLocation, 30, 170);

      // Código do ticket
      ctx.fillStyle = "#A3E635";
      ctx.font = "bold 18px Arial";
      ctx.fillText(code, 30, 220);

      // Carregar imagem do QR Code
      const qrImage = new Image();
      qrImage.src = qrCodeDataUrl;

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
      });

      // Desenhar QR Code
      ctx.drawImage(qrImage, 100, 250, 200, 200);

      // Linha divisória
      ctx.strokeStyle = "#1D1D24";
      ctx.beginPath();
      ctx.moveTo(10, 500);
      ctx.lineTo(390, 500);
      ctx.stroke();

      // Rodapé
      ctx.fillStyle = "#A1A1AA";
      ctx.font = "12px Arial";
      ctx.fillText("Apresente este código na entrada", 30, 530);
      ctx.fillText(`Código: ${code}`, 30, 555);

      // Converter canvas para blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      // Criar URL de download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ingresso-${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        title: "Ticket salvo",
        description: `Ingresso ${code} baixado com sucesso!`,
        variant: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar o ticket.";
      showToast({
        title: "Erro ao salvar",
        description: message,
        variant: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({
        title: "Link copiado",
        description: "Link do ingresso copiado para a área de transferência",
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "error",
      });
    }
  }

  async function onCancel() {
    const confirmed = window.confirm(
      "Cancelar este ingresso? O estoque será devolvido para venda. Outros ingressos desta reserva permanecerão válidos.",
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      const result = await cancelTicket(ticketId);
      showToast({
        title: "Ingresso cancelado",
        description: result.reservationStillActive 
          ? "Ingresso cancelado. A reserva permanece ativa com os demais ingressos."
          : "Ingresso cancelado e reserva encerrada.",
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível cancelar o ingresso.";
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
      <button
        type="button"
        onClick={handleShare}
        className="flex h-10 items-center gap-2 rounded-md border border-surface-2 px-3 text-sm font-bold text-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-2"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex h-10 items-center gap-2 rounded-md border border-surface-2 px-3 text-sm font-bold text-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-2 disabled:opacity-50"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isDownloading ? "Salvando..." : "Salvar"}
      </button>
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