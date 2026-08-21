"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  Camera,
  CheckCircle2,
  Keyboard,
  RefreshCcw,
  ScanLine,
  TicketCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { cancelGateTicket, validateGateTicket } from "@/lib/api";
import type { Event, GateResult, GateResultCode } from "@/types/event";

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

const resultStyles: Record<GateResultCode, { label: string; className: string }> = {
  VALID: {
    label: "Valido",
    className: "border-success/50 bg-success/10 text-success",
  },
  INVALID: {
    label: "Invalido",
    className: "border-error/50 bg-error/10 text-error",
  },
  ALREADY_USED: {
    label: "Ja utilizado",
    className: "border-yellow-400/60 bg-yellow-400/10 text-yellow-300",
  },
  WRONG_EVENT: {
    label: "Evento errado",
    className: "border-orange-400/60 bg-orange-400/10 text-orange-300",
  },
  EVENT_CANCELLED: {
    label: "Evento cancelado",
    className: "border-error/50 bg-error/10 text-error",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "border-zinc-400/50 bg-zinc-400/10 text-zinc-200",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function GateClient({ events }: { events: Event[] }) {
  const [eventId, setEventId] = useState(events[0]?.id || "");
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<GateResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanRef = useRef("");
  const submitRef = useRef<
    (action: "validate" | "cancel", forcedIdentifier?: string) => Promise<void>
  >(async () => {});

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === eventId),
    [eventId, events],
  );
  const canScan = typeof window !== "undefined" && Boolean(window.BarcodeDetector);

  const submit = useCallback(
    async (action: "validate" | "cancel", forcedIdentifier?: string) => {
      const nextIdentifier = (forcedIdentifier || identifier).trim();
      if (!nextIdentifier) {
        setError("Informe o QR, link ou codigo do ingresso.");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        const response =
          action === "validate"
            ? await validateGateTicket({ identifier: nextIdentifier, eventId })
            : await cancelGateTicket({ identifier: nextIdentifier, eventId });
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel processar o ingresso.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, identifier],
  );

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  useEffect(() => {
    if (!isScanning || !videoRef.current || !window.BarcodeDetector) {
      return;
    }

    let cancelled = false;
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const scan = async () => {
          if (cancelled || !videoRef.current) return;

          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;
            if (value && value !== lastScanRef.current) {
              lastScanRef.current = value;
              setIdentifier(value);
              await submitRef.current("validate", value);
            }
          } catch {
            setError("Nao foi possivel ler o QR Code pela camera.");
          }

          window.setTimeout(scan, 700);
        };

        void scan();
      } catch {
        setError("Permita o acesso a camera para usar o scanner.");
        setIsScanning(false);
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [isScanning]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit("validate");
  }

  const style = result ? resultStyles[result.result] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col gap-5 rounded-lg border border-surface-2 bg-surface p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black uppercase text-accent">Portaria</span>
          <h1 className="text-3xl font-black text-text">Controle de entrada</h1>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-text">
          Evento
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="h-11 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>

        {selectedEvent && (
          <div className="grid gap-3 rounded-md border border-surface-2 bg-background p-4 text-sm sm:grid-cols-3">
            <span className="text-muted-foreground">
              Data <strong className="block text-text">{formatDate(selectedEvent.date)}</strong>
            </span>
            <span className="text-muted-foreground">
              Local <strong className="block truncate text-text">{selectedEvent.location}</strong>
            </span>
            <span className="text-muted-foreground">
              Estoque <strong className="block text-text">{selectedEvent.availableTickets}</strong>
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-surface-2 bg-background">
          <div className="flex items-center justify-between border-b border-surface-2 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-text">
              <ScanLine className="h-4 w-4 text-accent" />
              Scanner QR
            </span>
            <button
              type="button"
              disabled={!canScan}
              onClick={() => setIsScanning((current) => !current)}
              className="flex h-9 items-center gap-2 rounded-md border border-surface-2 px-3 text-sm font-bold text-text transition-colors hover:bg-surface disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {isScanning ? "Parar" : "Camera"}
            </button>
          </div>
          <div className="aspect-video bg-black">
            {isScanning ? (
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                <ScanLine className="h-10 w-10 text-accent" />
                {canScan
                  ? "Ative a camera para ler QR Codes."
                  : "Scanner automatico indisponivel neste navegador."}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-bold text-text">
            <span className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-accent" />
              Digitacao manual
            </span>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Cole o link do QR ou digite o codigo"
              className="h-11 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isSubmitting || !eventId}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              <TicketCheck className="h-4 w-4" />
              Validar entrada
            </button>
            <button
              type="button"
              disabled={isSubmitting || !eventId}
              onClick={() => submit("cancel")}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-error/50 px-4 text-sm font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Cancelar ingresso
            </button>
          </div>
        </form>
      </section>

      <aside className="flex h-fit flex-col gap-4 rounded-lg border border-surface-2 bg-surface p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-text">Resultado</h2>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setError("");
              setIdentifier("");
              lastScanRef.current = "";
            }}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-2 text-muted-foreground transition-colors hover:text-text"
            aria-label="Limpar resultado"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-error/50 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {!result && !error && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-surface-2 bg-background p-6 text-center text-muted-foreground">
            <ScanLine className="h-10 w-10 text-accent" />
            Aguardando validacao
          </div>
        )}

        {result && style && (
          <div className={`flex flex-col gap-4 rounded-md border p-5 ${style.className}`}>
            <span className="flex items-center gap-2 text-sm font-black uppercase">
              {result.valid ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : result.result === "ALREADY_USED" || result.result === "WRONG_EVENT" ? (
                <TriangleAlert className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {style.label}
            </span>
            <strong className="text-2xl font-black">{result.message}</strong>

            {result.ticket && (
              <div className="grid gap-3 rounded-md bg-background/60 p-4 text-sm text-text">
                <span>
                  Codigo <strong>{result.ticket.code}</strong>
                </span>
                <span>
                  Evento <strong>{result.ticket.event.title}</strong>
                </span>
                <span>
                  Cliente <strong>{result.ticket.customer.name}</strong>
                </span>
                <span>
                  Status <strong>{result.ticket.status}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
