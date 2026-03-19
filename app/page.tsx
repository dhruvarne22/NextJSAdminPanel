import Link from "next/link";
import AdminSidebar from "./components/admin/AdminSidebar";
import { supabaseServer } from "@/lib/supabase/server";
import {
  Building2, InboxIcon, CheckCircle2,
  XCircle, Clock, ArrowRight, TrendingUp,
  Activity, Zap
} from "lucide-react";

// ─────────────────────────── DATA FETCH ──────────────────────────────────────
async function getDashboardStats() {
  const [
    { count: total },
    { count: pending },
    { count: approved },
    { count: rejected },
    { data: recent },
  ] = await Promise.all([
    supabaseServer.from("properties").select("*", { count: "exact", head: true }),
    supabaseServer.from("properties").select("*", { count: "exact", head: true }).eq("status", "W"),
    supabaseServer.from("properties").select("*", { count: "exact", head: true }).eq("status", "Y"),
    supabaseServer.from("properties").select("*", { count: "exact", head: true }).eq("status", "N"),
    supabaseServer
      .from("properties")
      .select("id, name, location, status, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5),
  ]);

  return {
    total:    total    ?? 0,
    pending:  pending  ?? 0,
    approved: approved ?? 0,
    rejected: rejected ?? 0,
    recent:   recent   ?? [],
  };
}

// ─────────────────────────── PAGE ────────────────────────────────────────────
export default async function AdminHome() {
  const stats = await getDashboardStats();

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">

        {/* ── TOP BAR ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#B0B0B0] font-medium tracking-wider uppercase">
                Admin Panel
              </p>
              <h1 className="text-lg font-bold text-[#0D0D0D] tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span className="text-xs text-[#B0B0B0]">Live</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8 max-w-5xl">

          {/* ── HERO BANNER ───────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[#0D0D0D] p-8 text-white"
            style={{ minHeight: 180 }}
          >
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
            {/* Glow blob */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#B0B0B0] text-xs tracking-widest uppercase font-medium mb-2">
                    Vardaan Properties
                  </p>
                  <h2
                    className="text-3xl font-bold tracking-tight mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Welcome back, Admin
                  </h2>
                  <p className="text-[#B0B0B0] text-sm mt-2">
                    {stats.pending > 0 ? (
                      <>
                        You have{" "}
                        <span className="text-amber-400 font-semibold">
                          {stats.pending} pending
                        </span>{" "}
                        {stats.pending === 1 ? "property" : "properties"} awaiting review.
                      </>
                    ) : (
                      "All properties are reviewed. Nothing pending."
                    )}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1">
                  <span className="text-5xl font-bold tracking-tighter">{stats.total}</span>
                  <span className="text-[#B0B0B0] text-xs">total properties</span>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-3 mt-6">
                <Link
                  href="/admin/requests"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0D0D0D] text-sm font-semibold hover:bg-[#F7F7F7] transition-colors"
                >
                  <InboxIcon size={14} />
                  Review Requests
                  {stats.pending > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {stats.pending}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/properties"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors border border-white/10"
                >
                  <Building2 size={14} />
                  All Properties
                </Link>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Building2 size={16} />}
              href="/admin/properties"
              variant="default"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock size={16} />}
              href="/admin/requests"
              variant="amber"
              pulse={stats.pending > 0}
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={<CheckCircle2 size={16} />}
              href="/admin/properties?status=Y"
              variant="green"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={<XCircle size={16} />}
              href="/admin/properties?status=N"
              variant="red"
            />
          </div>

          {/* ── TWO-COLUMN ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Recent properties */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EDEDED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#0D0D0D] flex items-center justify-center">
                    <Activity size={12} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-[#0D0D0D] text-sm">Recent Listings</h3>
                </div>
                <Link
                  href="/admin/properties"
                  className="text-xs text-[#B0B0B0] hover:text-[#0D0D0D] flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              <div className="divide-y divide-[#F7F7F7]">
                {stats.recent.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-[#B0B0B0]">
                    No properties yet
                  </div>
                ) : (
                  stats.recent.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/admin/properties/${p.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F7F7] transition-colors group"
                    >
                      {/* Status dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.status === "Y" ? "bg-green-500"
                        : p.status === "N" ? "bg-red-500"
                        : "bg-amber-400"
                      }`} />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0D0D0D] truncate">{p.name}</p>
                        <p className="text-xs text-[#B0B0B0] truncate">{p.location}</p>
                      </div>

                      <StatusPill status={p.status} />

                      <ArrowRight
                        size={13}
                        className="text-[#EDEDED] group-hover:text-[#B0B0B0] transition-colors flex-shrink-0"
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick nav cards */}
            <div className="space-y-4">
              <QuickNavCard
                href="/admin/requests"
                icon={<InboxIcon size={20} />}
                title="Review Requests"
                description="Approve or reject new property submissions"
                badge={stats.pending > 0 ? `${stats.pending} pending` : undefined}
                badgeColor="amber"
              />
              <QuickNavCard
                href="/admin/properties"
                icon={<Building2 size={20} />}
                title="All Properties"
                description="Browse, search and manage every listing"
              />
              <QuickNavCard
                href="/admin"
                icon={<TrendingUp size={20} />}
                title="Analytics"
                description="View property stats and trends"
                comingSoon
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────── STAT CARD ───────────────────────────────────────
function StatCard({
  label, value, icon, href, variant, pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  variant: "default" | "amber" | "green" | "red";
  pulse?: boolean;
}) {
  const styles = {
    default: { card: "bg-white border-[#EDEDED]", icon: "bg-[#0D0D0D] text-white",    val: "text-[#0D0D0D]", lbl: "text-[#B0B0B0]" },
    amber:   { card: "bg-amber-50 border-amber-100",  icon: "bg-amber-500 text-white",    val: "text-amber-700", lbl: "text-amber-500" },
    green:   { card: "bg-green-50 border-green-100",  icon: "bg-green-500 text-white",    val: "text-green-700", lbl: "text-green-500" },
    red:     { card: "bg-red-50 border-red-100",      icon: "bg-red-500 text-white",      val: "text-red-700",   lbl: "text-red-400"  },
  }[variant];

  return (
    <Link
      href={href}
      className={`group relative rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${styles.card}`}
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
      )}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${styles.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${styles.val}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${styles.lbl}`}>{label}</p>
    </Link>
  );
}

// ─────────────────────────── QUICK NAV CARD ──────────────────────────────────
function QuickNavCard({
  href, icon, title, description, badge, badgeColor, comingSoon,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: "amber";
  comingSoon?: boolean;
}) {
  const Comp = comingSoon ? "div" : Link;

  return (
    <Comp
      href={comingSoon ? undefined! : href}
      className={`block bg-white rounded-2xl border border-[#EDEDED] p-4 shadow-sm transition-all ${
        comingSoon ? "opacity-60 cursor-default" : "hover:shadow-md hover:border-[#0D0D0D]/20 group"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0 text-[#0D0D0D] group-hover:bg-[#0D0D0D] group-hover:text-white transition-all">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0D0D0D]">{title}</p>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                badgeColor === "amber" ? "bg-amber-100 text-amber-700" : "bg-[#F7F7F7] text-[#B0B0B0]"
              }`}>
                {badge}
              </span>
            )}
            {comingSoon && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#F7F7F7] text-[#B0B0B0]">
                Soon
              </span>
            )}
          </div>
          <p className="text-xs text-[#B0B0B0] mt-0.5 leading-relaxed">{description}</p>
        </div>
        {!comingSoon && (
          <ArrowRight size={13} className="text-[#EDEDED] group-hover:text-[#B0B0B0] transition-colors flex-shrink-0 mt-0.5" />
        )}
      </div>
    </Comp>
  );
}

// ─────────────────────────── STATUS PILL ─────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    W: { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
    Y: { label: "Approved", cls: "bg-green-100 text-green-700" },
    N: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}