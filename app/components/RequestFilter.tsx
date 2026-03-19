"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Filter, Clock, CheckCircle2, XCircle,
  Building2, MapPin, IndianRupee, ArrowRight,
  CalendarDays, SlidersHorizontal, X
} from "lucide-react";

type PropertyStatus = "W" | "Y" | "N";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  status: PropertyStatus;
  createdAt: string;
};

// ─────────────────────────── STATUS CONFIG ────────────────────────────────────
const STATUS_CONFIG: Record<PropertyStatus, {
  label: string;
  icon: React.ReactNode;
  pill: string;
  dot: string;
  filterBg: string;
  filterActive: string;
}> = {
  W: {
    label: "Pending",
    icon: <Clock size={11} />,
    pill: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    filterBg: "bg-amber-50 border-amber-200 text-amber-700",
    filterActive: "bg-amber-500 text-white border-amber-500",
  },
  Y: {
    label: "Approved",
    icon: <CheckCircle2 size={11} />,
    pill: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    filterBg: "bg-green-50 border-green-200 text-green-700",
    filterActive: "bg-green-600 text-white border-green-600",
  },
  N: {
    label: "Rejected",
    icon: <XCircle size={11} />,
    pill: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    filterBg: "bg-red-50 border-red-200 text-red-700",
    filterActive: "bg-red-600 text-white border-red-600",
  },
};

// ─────────────────────────── HELPERS ─────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatPrice(n: number | null): string {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─────────────────────────── COMPONENT ───────────────────────────────────────
export default function RequestsListWithFilter({
  properties,
}: {
  properties: Property[];
}) {
  const [search,        setSearch]        = useState("");
  const [activeFilter,  setActiveFilter]  = useState<PropertyStatus | "ALL">("ALL");
  const [sortBy,        setSortBy]        = useState<"newest" | "oldest" | "price">("newest");
  const [showSort,      setShowSort]      = useState(false);

  const filtered = useMemo(() => {
    let result = [...properties];

    // Status filter
    if (activeFilter !== "ALL") {
      result = result.filter((p) => p.status === activeFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === "price")  result.sort((a, b) => (b.totalCost ?? 0) - (a.totalCost ?? 0));

    return result;
  }, [properties, activeFilter, search, sortBy]);

  const counts = {
    ALL: properties.length,
    W:   properties.filter((p) => p.status === "W").length,
    Y:   properties.filter((p) => p.status === "Y").length,
    N:   properties.filter((p) => p.status === "N").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">

      {/* ── FILTER TOOLBAR ────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[#EDEDED] space-y-3">

        {/* Row 1: Search + Sort */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] focus:bg-white focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 transition-all placeholder:text-[#B0B0B0] text-[#0D0D0D]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] hover:bg-white hover:border-[#0D0D0D] transition-all text-[#3A3A3A] font-medium"
            >
              <SlidersHorizontal size={13} />
              {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Price"}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#EDEDED] rounded-xl shadow-lg z-20 overflow-hidden">
                {(["newest", "oldest", "price"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortBy === opt
                        ? "bg-[#0D0D0D] text-white font-medium"
                        : "text-[#3A3A3A] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    {opt === "newest" ? "Newest first" : opt === "oldest" ? "Oldest first" : "Highest price"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {/* All chip */}
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              activeFilter === "ALL"
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-[#F7F7F7] text-[#3A3A3A] border-[#EDEDED] hover:border-[#B0B0B0]"
            }`}
          >
            <Building2 size={11} />
            All
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeFilter === "ALL" ? "bg-white/20 text-white" : "bg-[#EDEDED] text-[#B0B0B0]"
            }`}>
              {counts.ALL}
            </span>
          </button>

          {(["W", "Y", "N"] as PropertyStatus[]).map((s) => {
            const cfg    = STATUS_CONFIG[s];
            const isActive = activeFilter === s;
            return (
              <button
                key={s}
                onClick={() => setActiveFilter(isActive ? "ALL" : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isActive ? cfg.filterActive : `${cfg.filterBg} hover:opacity-80`
                }`}
              >
                {cfg.icon}
                {cfg.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/25" : "bg-white/60"
                }`}>
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESULTS COUNT ─────────────────────────────────────────── */}
      <div className="px-5 py-2.5 bg-[#F7F7F7] border-b border-[#EDEDED] flex items-center justify-between">
        <p className="text-xs text-[#B0B0B0]">
          Showing <span className="font-semibold text-[#0D0D0D]">{filtered.length}</span> of {properties.length} requests
        </p>
        {(search || activeFilter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setActiveFilter("ALL"); }}
            className="text-xs text-[#B0B0B0] hover:text-[#0D0D0D] flex items-center gap-1 transition-colors"
          >
            <X size={11} />
            Clear filters
          </button>
        )}
      </div>

      {/* ── LIST ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] flex items-center justify-center">
            <Search size={20} className="text-[#B0B0B0]" />
          </div>
          <div>
            <p className="font-semibold text-[#0D0D0D] text-sm">No results found</p>
            <p className="text-xs text-[#B0B0B0] mt-0.5">
              {search ? `No properties matching "${search}"` : "No properties in this category"}
            </p>
          </div>
          <button
            onClick={() => { setSearch(""); setActiveFilter("ALL"); }}
            className="text-xs text-[#0D0D0D] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F7F7F7]">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <Link
                key={p.id}
                href={`/admin/properties/${p.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F7F7] transition-colors group"
              >
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

                {/* Icon box */}
                <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0 group-hover:bg-[#EDEDED] transition-colors">
                  <Building2 size={16} className="text-[#B0B0B0]" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                      {p.name ?? "Untitled Property"}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.pill}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#B0B0B0]">
                    {p.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={10} />
                        {p.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <CalendarDays size={10} />
                      {timeAgo(p.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-[#0D0D0D]">
                    {formatPrice(p.totalCost)}
                  </span>
                  <span className="text-[10px] text-[#B0B0B0]">total cost</span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="text-[#EDEDED] group-hover:text-[#B0B0B0] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                />
              </Link>
            );
          })}
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-[#EDEDED] bg-[#F7F7F7]">
          <p className="text-xs text-[#B0B0B0] text-center">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>
      )}
    </div>
  );
}