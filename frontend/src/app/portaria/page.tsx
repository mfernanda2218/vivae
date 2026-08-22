import { GateClient } from "./GateClient";
import { getEvents } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  const response = await getEvents({ limit: 100 });

  return (
    <RoleGuard allowedRoles={["GATE"]}>
      <GateClient events={response.data} />
    </RoleGuard>
  );
}
