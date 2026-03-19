import { supabaseServer } from "@/lib/supabase/server";
import { PropertyStatus } from "@/lib/status";
import RequestsListWithFilter from "@/app/components/RequestFilter";
import {
  Building2, Clock, CheckCircle2, XCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  status: PropertyStatus;
  createdAt: string;
};

export default async function RequestsPage() {
  const { data } = await supabaseServer
    .from("properties")
    .select("id, name, location, totalCost, status, createdAt")
    .order("createdAt", { ascending: false });

  const properties = (data ?? []) as Property[];

  const total    = properties.length;
  const waiting  = properties.filter((p) => p.status === "W").length;
  const approved = properties.filter((p) => p.status === "Y").length;
  const rejected = properties.filter((p) => p.status === "N").length;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-30">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span className="text-[#EDEDED]">|</span>
            <div>
              <p className="text-xs text-[#B0B0B0] font-medium tracking-wider uppercase">
                Admin
              </p>
              <h1 className="text-lg font-bold text-[#0D0D0D] tracking-tight leading-none">
                Property Requests
              </h1>
            </div>
          </div>

          {waiting > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-xs font-semibold text-amber-700">
                {waiting} awaiting review
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-8 space-y-6 max-w-6xl">

        {/* ── STAT CARDS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile
            label="Total"
            value={total}
            icon={<Building2 size={16} />}
            variant="default"
          />
          <StatTile
            label="Pending"
            value={waiting}
            icon={<Clock size={16} />}
            variant="amber"
            pulse={waiting > 0}
          />
          <StatTile
            label="Approved"
            value={approved}
            icon={<CheckCircle2 size={16} />}
            variant="green"
          />
          <StatTile
            label="Rejected"
            value={rejected}
            icon={<XCircle size={16} />}
            variant="red"
          />
        </div>

        {/* ── FILTER + LIST ─────────────────────────────────────────── */}
        <RequestsListWithFilter properties={properties} />
      </div>
    </div>
  );
}

// ─────────────────────────── STAT TILE ───────────────────────────────────────
function StatTile({
  label, value, icon, variant, pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: "default" | "amber" | "green" | "red";
  pulse?: boolean;
}) {
  const s = {
    default: { card: "bg-white border-[#EDEDED]",       icon: "bg-[#0D0D0D] text-white",    val: "text-[#0D0D0D]", lbl: "text-[#B0B0B0]" },
    amber:   { card: "bg-amber-50 border-amber-100",    icon: "bg-amber-500 text-white",    val: "text-amber-700", lbl: "text-amber-500" },
    green:   { card: "bg-green-50 border-green-100",    icon: "bg-green-500 text-white",    val: "text-green-700", lbl: "text-green-500" },
    red:     { card: "bg-red-50 border-red-100",        icon: "bg-red-500 text-white",      val: "text-red-700",   lbl: "text-red-400"  },
  }[variant];

  return (
    <div className={`relative rounded-2xl border p-5 shadow-sm ${s.card}`}>
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
      )}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${s.val}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${s.lbl}`}>{label}</p>
    </div>
  );
}