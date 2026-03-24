import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PropertyStatus, STATUS_MAP } from "@/lib/status";
import StatusUpdateForm from "./StatusForm";
import StatusBadge from "@/app/components/StatusBadge";
import PropertyMediaSlider from "@/app/components/PropertyMediaSlider";
import PropertyHighlightsForm from "./PropertyHighlight";
import PropertyAboutForm from "./PropertyAboutForm";
import {
  MapPin, Tag, Home, Compass, Maximize2, IndianRupee,
  Clock, ArrowLeft, Activity
} from "lucide-react";
import Link from "next/link";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = parseInt(id, 10);

  const { data: property } = await supabaseServer
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (!property) notFound();

  const { data: activityLogs } = await supabaseServer
    .from("property_activity_log")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  const images = property.images ? JSON.parse(property.images) : [];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ── TOP HEADER BAR ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/properties"
              className="flex items-center gap-1.5 text-sm text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors"
            >
              <ArrowLeft size={15} />
              All Properties
            </Link>
            <span className="text-[#EDEDED]">|</span>
            <span className="text-sm font-semibold text-[#0D0D0D] truncate max-w-xs">
              {property.name}
            </span>
          </div>
          <StatusBadge status={property.status} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── PROPERTY TITLE ──────────────────────────────────────────── */}
        <div className="bg-[#0D0D0D] rounded-2xl p-6 text-white relative overflow-hidden">
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative">
            <p className="text-[#B0B0B0] text-xs font-medium tracking-widest uppercase mb-2">
              Property #{propertyId}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <div className="flex items-center gap-1.5 mt-2 text-[#B0B0B0] text-sm">
              <MapPin size={13} />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: media + details + highlights + about */}
          <div className="lg:col-span-2 space-y-6">

            {/* Media */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#EDEDED] shadow-sm">
              <PropertyMediaSlider images={images} youtubeVideo={property.youtubeVideo} propertyId={propertyId} />
            </div>

            {/* Property Details Grid */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <SectionHeader icon={<Tag size={15} />} title="Property Details" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <DetailTile icon={<MapPin size={13} />}    label="Location"   value={property.location} />
                <DetailTile icon={<Tag size={13} />}       label="Category"   value={property.propertyCategory} />
                <DetailTile icon={<Home size={13} />}      label="Type"       value={property.propertyType} />
                <DetailTile icon={<Compass size={13} />}   label="Facing"     value={property.facing} />
                <DetailTile icon={<Maximize2 size={13} />} label="Area (sq.yd)" value={property.totalAreaSqYd} />
                <DetailTile
                  icon={<IndianRupee size={13} />}
                  label="Total Cost"
                  value={`₹ ${Number(property.totalCost).toLocaleString("en-IN")}`}
                  highlight
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <PropertyHighlightsForm
                propertyId={propertyId}
                initialHighlights={property.highlights}
              />
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <PropertyAboutForm
                propertyId={propertyId}
                initialValue={property.about_property}
              />
            </div>
          </div>

          {/* RIGHT: status + activity */}
          <div className="space-y-6">

            {/* Status update */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <StatusUpdateForm
                propertyId={propertyId}
                currentStatus={property.status}
              />
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <SectionHeader icon={<Activity size={15} />} title="Admin Activity" />
              <div className="mt-4 space-y-0">
                {!activityLogs || activityLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-3">
                      <Activity size={16} className="text-[#B0B0B0]" />
                    </div>
                    <p className="text-sm text-[#B0B0B0]">No activity yet</p>
                  </div>
                ) : (
                  activityLogs.map((log, i) => (
                    <ActivityItem
                      key={log.id}
                      log={log}
                      isLast={i === activityLogs.length - 1}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center text-white">
        {icon}
      </div>
      <h3 className="font-semibold text-[#0D0D0D] text-sm">{title}</h3>
    </div>
  );
}

// ── DETAIL TILE ─────────────────────────────────────────────────────────────
function DetailTile({
  icon, label, value, highlight = false,
}: {
  icon: React.ReactNode; label: string; value: any; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "bg-[#0D0D0D] border-[#0D0D0D]" : "bg-[#F7F7F7] border-[#EDEDED]"}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${highlight ? "text-[#B0B0B0]" : "text-[#B0B0B0]"}`}>
        {icon}
        <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className={`font-semibold text-sm ${highlight ? "text-white" : "text-[#0D0D0D]"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ── ACTIVITY ITEM ────────────────────────────────────────────────────────────
function ActivityItem({ log, isLast }: { log: any; isLast: boolean }) {
  const isApproved = log.to_status === "Y";
  const isRejected = log.to_status === "N";

  return (
    <div className={`relative pl-6 pb-4 ${!isLast ? "border-l-2 border-[#EDEDED] ml-2" : "ml-2"}`}>
      {/* Dot */}
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center
        ${isApproved ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-[#B0B0B0]"}`}
      />

      <div className="space-y-1">
        {log.activity_type === "STATUS_CHANGE" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusChip status={log.from_status} />
            <span className="text-[#B0B0B0] text-xs">→</span>
            <StatusChip status={log.to_status} />
          </div>
        )}
        {log.comment && (
          <p className="text-sm text-[#3A3A3A] leading-relaxed">{log.comment}</p>
        )}
        <div className="flex items-center gap-1 text-[10px] text-[#B0B0B0]">
          <Clock size={10} />
          {new Date(log.created_at).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-[#B0B0B0]">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    W: { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
    Y: { label: "Approved", cls: "bg-green-100 text-green-700" },
    N: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}