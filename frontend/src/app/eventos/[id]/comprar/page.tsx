// app/eventos/[id]/comprar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CheckoutClient } from "@/app/checkout/CheckoutClient";
import { getEvent } from "@/lib/api";
import { roleHome, Role } from "@/lib/roles";
import type { Event } from "@/types/event";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BuyEventPage({ params }: PageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("vivae_token");
    const userData = localStorage.getItem("vivae_user");
    const authenticated = !!(token && userData);
    
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      params.then((p) => {
        router.push(`/login?redirect=/eventos/${p.id}/comprar`);
      });
    } else {
      // Verificar se o usuário é CUSTOMER (único role que pode comprar)
      try {
        const user = JSON.parse(userData || "{}") as { role: Role };
        if (user.role !== "CUSTOMER") {
          // Redirecionar para a home do role dele
          const home = roleHome[user.role] || "/eventos";
          router.push(home);
          return;
        }
      } catch {
        // Dados corrompidos, redirecionar para login
        localStorage.removeItem("vivae_token");
        localStorage.removeItem("vivae_user");
        params.then((p) => {
          router.push(`/login?redirect=/eventos/${p.id}/comprar`);
        });
        return;
      }
      
      params.then((p) => {
        setEventId(p.id);
      });
    }
  }, [router, params]);

  if (isAuthenticated === null || !eventId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return <BuyEventPageContent eventId={eventId} />;
}

function BuyEventPageContent({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(eventId).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Evento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/eventos/${event.id}`} className="text-sm font-bold text-accent">
          Voltar para o evento
        </Link>
        <h1 className="text-3xl font-black text-text">Comprar ingresso</h1>
      </div>
      <CheckoutClient event={event} />
    </div>
  );
}