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
  Clock, ArrowLeft, Activity, Pencil, MessageSquare, AlertCircle
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────── DATE HELPERS ────────────────────────────────────
// Supabase returns "2026-04-09 21:07:12.609+00" — not valid ISO 8601.
// Normalize to a proper UTC string before parsing, then format in IST.
function parseDate(raw: string): Date {
  const normalized = raw
    .replace(" ", "T")             // space → T
    .replace(/([+-]\d{2})$/, "$1:00") // +00 → +00:00  (if missing colon)
    .replace(/\+00:00$/, "Z");     // +00:00 → Z  (unambiguous UTC)
  return new Date(normalized);
}

function fmtIST(raw: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseDate(raw).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    ...opts,
  });
}

function fmtDateIST(raw: string): string {
  return fmtIST(raw, { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTimeIST(raw: string): string {
  return fmtIST(raw, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function relativeIST(raw: string): string {
  const date     = parseDate(raw);
  const IST      = { timeZone: "Asia/Kolkata" } as const;
  const todayStr = new Date().toLocaleDateString("en-CA", IST);
  const dateStr  = date.toLocaleDateString("en-CA", IST);
  const ydayStr  = new Date(Date.now() - 86400000).toLocaleDateString("en-CA", IST);
  const timeOnly = date.toLocaleTimeString("en-IN",
    { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  if (dateStr === todayStr) return "Today at " + timeOnly;
  if (dateStr === ydayStr)  return "Yesterday at " + timeOnly;
  return fmtDateIST(raw);
}


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

  // Split: user edits vs admin status changes
  const userEdits   = (activityLogs ?? []).filter((l: any) => l.activity_type === "USER_EDIT");
  const adminLogs   = (activityLogs ?? []).filter((l: any) => l.activity_type !== "USER_EDIT");
  const lastEditLog = userEdits[0] ?? null;   // most recent user edit

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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#B0B0B0] text-xs font-medium tracking-widest uppercase mb-2">
                  Property #{propertyId}
                </p>
                <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
                <div className="flex items-center gap-1.5 mt-2 text-[#B0B0B0] text-sm">
                  <MapPin size={13} />
                  <span>{property.location}</span>
                </div>
              </div>

              {/* Last edited badge — shown only when user has edited */}
              {lastEditLog && (
                <div className="flex-shrink-0 flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-2">
                  <Pencil size={13} className="text-amber-400" />
                  <div>
                    <p className="text-amber-300 text-[10px] font-semibold uppercase tracking-wide">
                      User Edited
                    </p>
                    <p className="text-amber-200 text-[11px] font-medium">
                      {fmtDateTimeIST(lastEditLog.created_at)}
                    </p>
                  </div>
                </div>
              )}
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

          {/* RIGHT: user edits + status + activity */}
          <div className="space-y-6">

            {/* ── User Edit History ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <SectionHeader icon={<Pencil size={15} />} title="User Edit History" />

              {userEdits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center mt-3">
                  <div className="w-9 h-9 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-2">
                    <Pencil size={15} className="text-[#B0B0B0]" />
                  </div>
                  <p className="text-xs text-[#B0B0B0]">No user edits yet</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {userEdits.map((log: any, i: number) => (
                    <UserEditItem key={log.id} log={log} isLatest={i === 0} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Status update ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <StatusUpdateForm
                propertyId={propertyId}
                currentStatus={property.status}
              />
            </div>

            {/* ── Admin Activity log ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6">
              <SectionHeader icon={<Activity size={15} />} title="Admin Activity" />
              <div className="mt-4 space-y-0">
                {adminLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-3">
                      <Activity size={16} className="text-[#B0B0B0]" />
                    </div>
                    <p className="text-sm text-[#B0B0B0]">No admin activity yet</p>
                  </div>
                ) : (
                  adminLogs.map((log: any, i: number) => (
                    <ActivityItem
                      key={log.id}
                      log={log}
                      isLast={i === adminLogs.length - 1}
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
          {fmtDateTimeIST(log.created_at)}
        </div>
      </div>
    </div>
  );
}

// ── USER EDIT ITEM ───────────────────────────────────────────────────────────
function UserEditItem({ log, isLatest }: { log: any; isLatest: boolean }) {
  const timeStr = relativeIST(log.created_at);

  // Strip the "✏️ User edit note: " prefix if present
  const raw     = log.comment as string ?? "";
  const cleaned = raw.replace(/^[✏️\s]*User edit note:\s*/i, "").trim();

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${
      isLatest
        ? "bg-amber-50 border-amber-200"
        : "bg-[#F7F7F7] border-[#EDEDED]"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
            isLatest ? "bg-amber-500" : "bg-[#B0B0B0]"
          }`}>
            <Pencil size={10} className="text-white" />
          </div>
          <span className={`text-xs font-semibold ${
            isLatest ? "text-amber-700" : "text-[#3A3A3A]"
          }`}>
            {isLatest ? "Latest Edit" : "Previous Edit"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#B0B0B0]">
          <Clock size={9} />
          {timeStr}
        </div>
      </div>

      {/* Status transition */}
      {log.from_status && (
        <div className="flex items-center gap-1.5">
          <StatusChip status={log.from_status} />
          <span className="text-[#B0B0B0] text-[10px]">→</span>
          <StatusChip status={log.to_status} />
        </div>
      )}

      {/* User comment */}
      {cleaned ? (
        <div className="flex items-start gap-2">
          <MessageSquare size={12} className={`flex-shrink-0 mt-0.5 ${
            isLatest ? "text-amber-500" : "text-[#B0B0B0]"
          }`} />
          <p className={`text-xs leading-relaxed ${
            isLatest ? "text-amber-800" : "text-[#3A3A3A]"
          }`}>
            {cleaned}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[10px] text-[#B0B0B0]">
          <AlertCircle size={10} />
          No comment provided
        </div>
      )}

      {/* Full timestamp */}
      <p className="text-[10px] text-[#B0B0B0]">
        {fmtDateTimeIST(log.created_at)}
      </p>
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