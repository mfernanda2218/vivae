import { GateClient } from "./GateClient";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  const response = await getEvents({ limit: 100 });

  return <GateClient events={response.data} />;
}
