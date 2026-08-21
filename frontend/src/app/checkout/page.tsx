import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { getEvent } from "@/lib/api";

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

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const eventId = readParam(params, "eventId");

  if (!eventId) {
    notFound();
  }

  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/eventos/${event.id}`} className="text-sm font-bold text-accent">
          Voltar para o evento
        </Link>
        <h1 className="text-3xl font-black text-text">Checkout</h1>
      </div>
      <CheckoutClient event={event} />
    </div>
  );
}
