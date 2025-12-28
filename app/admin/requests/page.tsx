import StatCard from "@/app/components/StatCard";
import { supabaseServer } from "@/lib/supabase/server";

import { PropertyStatus } from "@/lib/status";
import RequestsListWithFilter from "@/app/components/RequestFilter";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  status: PropertyStatus;
};

export default async function RequestsPage() {
  const { data } = await supabaseServer
    .from("properties")
    .select("id, name, location, totalCost, status, createdAt")
    .order("createdAt", { ascending: false });

  const properties = (data ?? []) as Property[];

  const total = properties.length;
  const waiting = properties.filter((p) => p.status === "W").length;
  const approved = properties.filter((p) => p.status === "Y").length;
  const rejected = properties.filter((p) => p.status === "N").length;

  return (
    <div className="space-y-8">
      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={total} />
        <StatCard title="Waiting" value={waiting} color="yellow" />
        <StatCard title="Approved" value={approved} color="green" />
        <StatCard title="Rejected" value={rejected} color="red" />
      </div>

      {/* ===== FILTERED REQUEST LIST ===== */}
      <RequestsListWithFilter properties={properties} />
    </div>
  );
}
