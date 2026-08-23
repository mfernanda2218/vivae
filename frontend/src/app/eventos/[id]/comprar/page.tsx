// app/eventos/[id]/comprar/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutClient } from "@/app/checkout/CheckoutClient";
import { getEvent } from "@/lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
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