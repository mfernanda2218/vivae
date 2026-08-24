"use client";

import { useState, useEffect } from "react";
import { Loader2, Armchair } from "lucide-react";

interface Seat {
  row: string;
  seat: string;
  available: boolean;
}

interface SeatMapProps {
  eventId: string;
  onSeatsChange: (seats: string[]) => void;
  maxSelection: number;
  disabled?: boolean;
}

export function SeatMap({ eventId, onSeatsChange, maxSelection, disabled = false }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeats() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/seats`);
        if (!response.ok) throw new Error("Failed to load seats");
        
        const data = await response.json();
        setSeats(data.seats || []);
      } catch (err) {
        setError("Não foi possível carregar o mapa de assentos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSeats();
  }, [eventId]);

  function toggleSeat(seatId: string) {
    if (disabled) return;

    const newSelected = new Set(selectedSeats);
    
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else if (newSelected.size < maxSelection) {
      newSelected.add(seatId);
    }

    setSelectedSeats(newSelected);
    onSeatsChange(Array.from(newSelected));
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-error/50 bg-error/10 p-4 text-sm text-error">
        {error}
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="rounded-md border border-surface-2 bg-surface p-4 text-center text-sm text-muted-foreground">
        Este evento não possui mapa de assentos
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-success text-background">
            <Armchair className="h-3 w-3" />
          </span>
          Disponível
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-error text-background">
            <Armchair className="h-3 w-3" />
          </span>
          Ocupado
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-accent text-background">
            <Armchair className="h-3 w-3" />
          </span>
          Selecionado
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-8 text-center text-sm font-bold text-muted-foreground">
              {row}
            </span>
            <div className="flex flex-wrap gap-2">
              {seatsByRow[row].map((seat) => {
                const seatId = `${seat.row}-${seat.seat}`;
                const isSelected = selectedSeats.has(seatId);
                
                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={!seat.available || disabled}
                    onClick={() => toggleSeat(seatId)}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border transition-all ${
                      !seat.available
                        ? "border-error/30 bg-error/20 text-muted-foreground cursor-not-allowed"
                        : isSelected
                        ? "border-accent bg-accent text-background scale-110"
                        : "border-surface-2 bg-surface hover:border-accent/50 hover:bg-surface-2"
                    }`}
                    title={`Fileira ${seat.row}, Assento ${seat.seat}`}
                  >
                    <Armchair className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedSeats.size > 0 && (
          <span className="font-bold text-text">
            {selectedSeats.size} de {maxSelection} assentos selecionados
          </span>
        )}
      </div>
    </div>
  );
}
