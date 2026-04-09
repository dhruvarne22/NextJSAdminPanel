import { supabaseServer } from "@/lib/supabase/server";
import { ArrowLeft, Phone, Eye, EyeOff, Bell } from "lucide-react";
import Link from "next/link";
import ContactsListWithFilter from "./contactsFilter";
import { markAllContactsRead } from "./action";

export const metadata = { title: "Contacts" };

export type ContactRow = {
  id:               string;
  property_id:      string;
  user_id:          string | null;
  user_name:        string | null;
  user_phone:       string | null;
  user_email:       string | null;
  created_at:       string;
  is_read:          boolean;
  // joined from properties
  propertyName:     string | null;
  propertyLocation: string | null;
  propertyAddress:  string | null;
  propertyCategory: string | null;
  propertyType:     string | null;
  totalAreaSqYd:    number | null;
  pricePerSqYd:     number | null;
  totalCost:        number | null;
  propertyStatus:   string | null;
  propertyImage:    string | null;   // first image for thumbnail
};

export default async function ContactsPage() {

  // ── Fetch contacts ──────────────────────────────────────────────────────
  const { data: raw } = await supabaseServer
    .from("property_intrested")
    .select("*")
    .order("created_at", { ascending: false });

  // ── Fetch properties ────────────────────────────────────────────────────
  const { data: properties } = await supabaseServer
    .from("properties")
    .select(`id, name, address, location, "propertyCategory", "propertyType", "totalAreaSqYd", "pricePerSqYd", "totalCost", status, images`);


    console.log("properties");
    console.log(properties);
  const propMap = Object.fromEntries(
    (properties ?? []).map((p) => [String(p.id), p])
  );

  console.log("PROPR MAP *********************************************************************************");
  console.log(propMap);

  // Parse first image from JSON array stored in "images" text column
  function firstImage(imagesJson: string | null): string | null {
    if (!imagesJson) return null;
    try {
      const arr = JSON.parse(imagesJson);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch { return null; }
  }

  const contacts: ContactRow[] = (raw ?? []).map((r) => {
    const p = propMap[r.property_id];
    return {
      id:               r.id,
      property_id:      r.property_id,
      user_id:          r.user_id,
      user_name:        r.user_name,
      user_phone:       r.user_phone,
      user_email:       r.user_email,
      created_at:       r.created_at,
      is_read:          r.is_read ?? false,
      propertyName:     p?.name             ?? null,
      propertyLocation: p?.location         ?? null,
      propertyAddress:  p?.address          ?? null,
      propertyCategory: p?.propertyCategory ?? null,
      propertyType:     p?.propertyType     ?? null,
      totalAreaSqYd:    p?.totalAreaSqYd    ?? null,
      pricePerSqYd:     p?.pricePerSqYd     ?? null,
      totalCost:        p?.totalCost        ?? null,
      propertyStatus:   p?.status           ?? null,
      propertyImage:    firstImage(p?.images ?? null),
    };
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  const total    = contacts.length;
  const unread   = contacts.filter((c) => !c.is_read).length;
  const read     = contacts.filter((c) =>  c.is_read).length;
  const todayStr = new Date().toDateString();
  const today    = contacts.filter((c) => new Date(c.created_at).toDateString() === todayStr).length;

  const uniqueUsers = new Set(contacts.map((c) => c.user_id).filter(Boolean)).size;

  // ── Filter options ──────────────────────────────────────────────────────
  const categories = [...new Set(contacts.map((c) => c.propertyCategory).filter(Boolean))] as string[];
  const types      = [...new Set(contacts.map((c) => c.propertyType).filter(Boolean))]     as string[];
  const locations  = [...new Set(contacts.map((c) => c.propertyLocation).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-30">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors">
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span className="text-[#EDEDED]">|</span>
            <div>
              <p className="text-xs text-[#B0B0B0] font-medium tracking-wider uppercase">Admin</p>
              <h1 className="text-lg font-bold text-[#0D0D0D] tracking-tight leading-none">
                Contact Requests
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unread > 0 && (
              <form action={markAllContactsRead}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EDEDED] bg-white text-xs font-medium text-[#3A3A3A] hover:bg-[#F7F7F7] transition-colors"
                >
                  <Eye size={12} />
                  Mark all read
                </button>
              </form>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${unread > 0 ? "bg-[#0D0D0D]" : "bg-[#F7F7F7] border border-[#EDEDED]"}`}>
              {unread > 0
                ? <><Bell size={13} className="text-white" /><span className="text-xs font-semibold text-white">{unread} unread</span></>
                : <><Eye size={13} className="text-[#B0B0B0]" /><span className="text-xs font-semibold text-[#3A3A3A]">All read</span></>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl space-y-6">

        {/* ── HERO BANNER ─────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0D0D0D] p-7 text-white">
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            <HeroStat label="Total Contacts"  value={String(total)}       sub="all time"         />
            <HeroStat label="Unread"          value={String(unread)}      sub="awaiting review"  accent={unread > 0} />
            <HeroStat label="Read"            value={String(read)}        sub="already reviewed" />
            <HeroStat label="Today"           value={String(today)}       sub="new today"        accent={today > 0} />
          </div>
        </div>

        {/* ── STAT TILES ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile icon="📞" label="Total"        value={total}       cls="bg-white border-[#EDEDED]"         val="text-[#0D0D0D]" lbl="text-[#B0B0B0]" />
          <StatTile icon="🔴" label="Unread"       value={unread}      cls="bg-red-50 border-red-100"         val="text-red-700"   lbl="text-red-400"   pulse={unread > 0} />
          <StatTile icon="✅" label="Read"         value={read}        cls="bg-green-50 border-green-100"     val="text-green-700" lbl="text-green-500" />
          <StatTile icon="👤" label="Unique Users" value={uniqueUsers} cls="bg-blue-50 border-blue-100"       val="text-blue-700"  lbl="text-blue-400"  />
        </div>

        {/* ── LIST ────────────────────────────────────────────────────── */}
        <ContactsListWithFilter
          contacts={contacts}
          categories={categories}
          types={types}
          locations={locations}
        />

      </div>
    </div>
  );
}

// ─────────────────────────── HERO STAT ───────────────────────────────────────
function HeroStat({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[#B0B0B0] text-[10px] uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold tracking-tight leading-none ${accent ? "text-amber-400" : "text-white"}`}>{value}</p>
      <p className="text-[#B0B0B0] text-[11px] mt-1">{sub}</p>
    </div>
  );
}

// ─────────────────────────── STAT TILE ───────────────────────────────────────
function StatTile({ icon, label, value, cls, val, lbl, pulse = false }: {
  icon: string; label: string; value: number;
  cls: string; val: string; lbl: string; pulse?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border p-5 shadow-sm ${cls}`}>
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-2xl font-bold tracking-tight ${val}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${lbl}`}>{label}</p>
    </div>
  );
}