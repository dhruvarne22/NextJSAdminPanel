"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useTransition } from "react";
import type { ContactRow } from "./page";
import { markContactRead } from "./action";
import {
  Search, X, SlidersHorizontal, Phone, MapPin, Home, Tag,
  Maximize2, IndianRupee, ArrowRight, Clock, Mail, Eye,
  EyeOff, Building2, Filter, CheckCircle2
} from "lucide-react";

// ─────────────────────────── HELPERS ─────────────────────────────────────────
function timeAgo(dateStr: string) {
  // Supabase returns "2026-04-09 20:24:02+00" (space, not T).
  // Normalise to ISO 8601 so every JS engine parses it correctly.
  const normalized = dateStr.replace(" ", "T");
  const diff = Date.now() - new Date(normalized).getTime();
  if (diff < 0) return "just now";
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(dateStr: string) {
  const normalized = dateStr.replace(" ", "T");
  return new Date(normalized).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(n: number | null) {
  if (!n) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─────────────────────────── MAIN COMPONENT ──────────────────────────────────
export default function ContactsListWithFilter({
  contacts,
  categories,
  types,
  locations,
}: {
  contacts:   ContactRow[];
  categories: string[];
  types:      string[];
  locations:  string[];
}) {
  const [search,     setSearch]     = useState("");
  const [readFilter, setReadFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [category,   setCategory]   = useState("ALL");
  const [propType,   setPropType]   = useState("ALL");
  const [location,   setLocation]   = useState("ALL");
  const [sortBy,     setSortBy]     = useState<"newest" | "oldest">("newest");
  const [showSort,   setShowSort]   = useState(false);

  const filtered = useMemo(() => {
    let r = [...contacts];

    if (readFilter === "UNREAD") r = r.filter((c) => !c.is_read);
    if (readFilter === "READ")   r = r.filter((c) =>  c.is_read);
    if (category !== "ALL") r = r.filter((c) => c.propertyCategory === category);
    if (propType !== "ALL") r = r.filter((c) => c.propertyType     === propType);
    if (location !== "ALL") r = r.filter((c) => c.propertyLocation === location);

    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) =>
        c.user_name?.toLowerCase().includes(q)      ||
        c.user_phone?.toLowerCase().includes(q)     ||
        c.user_email?.toLowerCase().includes(q)     ||
        c.propertyName?.toLowerCase().includes(q)   ||
        c.propertyLocation?.toLowerCase().includes(q)
      );
    }

    r.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortBy === "newest" ? db - da : da - db;
    });

    return r;
  }, [contacts, search, readFilter, category, propType, location, sortBy]);

  const unreadCount = contacts.filter((c) => !c.is_read).length;
  const hasFilters  = search || readFilter !== "ALL" || category !== "ALL" || propType !== "ALL" || location !== "ALL";

  function clearAll() {
    setSearch(""); setReadFilter("ALL"); setCategory("ALL");
    setPropType("ALL"); setLocation("ALL");
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">

      {/* ── TOOLBAR ───────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[#EDEDED] space-y-3">

        {/* Row 1: Search + Sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
            <input
              type="text"
              placeholder="Search name, phone, email, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] focus:bg-white focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 transition-all placeholder:text-[#B0B0B0] text-[#0D0D0D]"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#0D0D0D]">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] hover:bg-white hover:border-[#0D0D0D] transition-all text-[#3A3A3A] font-medium"
            >
              <SlidersHorizontal size={13} />
              {sortBy === "newest" ? "Newest" : "Oldest"}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#EDEDED] rounded-xl shadow-lg z-20 overflow-hidden">
                {(["newest", "oldest"] as const).map((opt) => (
                  <button key={opt} onClick={() => { setSortBy(opt); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortBy === opt ? "bg-[#0D0D0D] text-white font-medium" : "text-[#3A3A3A] hover:bg-[#F7F7F7]"
                    }`}>
                    {opt === "newest" ? "Newest first" : "Oldest first"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Read/Unread + filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Read/Unread chips */}
          {(["ALL", "UNREAD", "READ"] as const).map((f) => {
            const label = f === "ALL" ? `All (${contacts.length})` : f === "UNREAD" ? `Unread (${unreadCount})` : `Read (${contacts.length - unreadCount})`;
            const isActive = readFilter === f;
            return (
              <button key={f} onClick={() => setReadFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isActive
                    ? f === "UNREAD"
                      ? "bg-red-500 text-white border-red-500"
                      : f === "READ"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                    : "bg-[#F7F7F7] text-[#3A3A3A] border-[#EDEDED] hover:border-[#B0B0B0]"
                }`}>
                {f === "UNREAD" ? <EyeOff size={11} /> : f === "READ" ? <Eye size={11} /> : <Filter size={11} />}
                {label}
              </button>
            );
          })}

          <div className="w-px h-6 bg-[#EDEDED] self-center" />

          {/* Category */}
          {categories.length > 0 && (
            <FilterSelect label="Category" icon={<Tag size={11} />}
              value={category} onChange={setCategory} options={categories} />
          )}

          {/* Type */}
          {types.length > 0 && (
            <FilterSelect label="Type" icon={<Home size={11} />}
              value={propType} onChange={setPropType} options={types} />
          )}

          {/* Location */}
          {locations.length > 0 && (
            <FilterSelect label="City" icon={<MapPin size={11} />}
              value={location} onChange={setLocation} options={locations} />
          )}
        </div>
      </div>

      {/* ── RESULTS BAR ───────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 bg-[#F7F7F7] border-b border-[#EDEDED] flex items-center justify-between">
        <p className="text-xs text-[#B0B0B0]">
          Showing <span className="font-semibold text-[#0D0D0D]">{filtered.length}</span> of {contacts.length}
          {unreadCount > 0 && (
            <span className="ml-2 text-red-500 font-semibold">{unreadCount} unread</span>
          )}
        </p>
        {hasFilters && (
          <button onClick={clearAll}
            className="text-xs text-[#B0B0B0] hover:text-[#0D0D0D] flex items-center gap-1 transition-colors">
            <X size={11} /> Clear filters
          </button>
        )}
      </div>

      {/* ── LIST ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] flex items-center justify-center">
            <Search size={20} className="text-[#B0B0B0]" />
          </div>
          <p className="font-semibold text-[#0D0D0D] text-sm">No results</p>
          <p className="text-xs text-[#B0B0B0]">
            {search ? `Nothing matching "${search}"` : "No contacts match the selected filters"}
          </p>
          <button onClick={clearAll}
            className="text-xs text-[#0D0D0D] underline underline-offset-2 hover:opacity-70">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F7F7F7]">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}

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

// ─────────────────────────── CONTACT CARD ────────────────────────────────────
function ContactCard({ contact: c }: { contact: ContactRow }) {
  const [isRead, setIsRead]     = useState(c.is_read);
  const [isPending, startTrans] = useTransition();

  function handleMarkRead() {
    if (isRead) return;
    setIsRead(true); // optimistic
    startTrans(() => markContactRead(c.id));
  }

  const price = formatPrice(c.totalCost);

  return (
    <div
      className={`relative transition-colors ${!isRead ? "bg-blue-50/40" : "bg-white"} hover:bg-[#F7F7F7]`}
      onClick={handleMarkRead}
    >
      {/* Unread left border */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r" />
      )}

      <div className="px-5 py-4 pl-6">
        <div className="flex gap-4">

          {/* ── Property thumbnail ─────────────────────────────────── */}
          <div className="flex-shrink-0 w-[100px]">
            <Link href={`/admin/properties/${c.property_id}`} onClick={(e) => e.stopPropagation()}>
              <div className="relative w-[100px] h-[70px] rounded-xl overflow-hidden bg-[#EDEDED] border border-[#EDEDED] hover:shadow-md transition-shadow">
                {c.propertyImage ? (
                  <Image
                    src={c.propertyImage}
                    alt={c.propertyName ?? "Property"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={20} className="text-[#B0B0B0]" />
                  </div>
                )}
                {/* Status dot overlay */}
                {c.propertyStatus && (
                  <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    c.propertyStatus === "Y" ? "bg-green-500"
                    : c.propertyStatus === "N" ? "bg-red-500"
                    : "bg-amber-400"
                  }`} />
                )}
              </div>
            </Link>
            {/* View property link */}
            <Link
              href={`/admin/properties/${c.property_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 mt-1.5 text-[10px] text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors"
            >
              View property <ArrowRight size={9} />
            </Link>
          </div>

          {/* ── Main content ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Header row: user + read indicator + time */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Unread dot */}
                {!isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5
                    shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                )}
                <div>
                  <p className={`text-sm font-bold ${!isRead ? "text-[#0D0D0D]" : "text-[#0D0D0D]"}`}>
                    {c.user_name ?? "Unknown User"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {c.user_phone && (
                      <span className="flex items-center gap-1 text-xs text-[#3A3A3A] font-medium">
                        <Phone size={10} />
                        {c.user_phone}
                      </span>
                    )}
                    {c.user_email && (
                      <span className="flex items-center gap-1 text-xs text-[#B0B0B0]">
                        <Mail size={10} />
                        {c.user_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Read badge */}
                {isRead ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 size={10} />
                    Read
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <EyeOff size={10} />
                    New
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-[#B0B0B0]">
                  <Clock size={9} />
                  {timeAgo(c.created_at)}
                </span>
              </div>
            </div>

            {/* Property detail block */}
            <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#EDEDED] space-y-2">

              {/* Property name + location */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#0D0D0D] leading-tight">
                    {c.propertyName ?? `Property #${c.property_id}`}
                  </p>
                  {c.propertyLocation && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-[#B0B0B0]" />
                      <span className="text-[11px] text-[#B0B0B0]">{c.propertyLocation}</span>
                      {c.propertyAddress && (
                        <span className="text-[11px] text-[#B0B0B0]">· {c.propertyAddress}</span>
                      )}
                    </div>
                  )}
                </div>
                {price && (
                  <span className="text-xs font-bold text-[#0D0D0D] bg-[#F7F7F7] px-2 py-0.5 rounded-lg border border-[#EDEDED] flex-shrink-0">
                    {price}
                  </span>
                )}
              </div>

              {/* Property spec chips */}
              <div className="flex flex-wrap gap-1.5">
                {c.propertyCategory && (
                  <Chip icon={<Tag size={9} />} label={c.propertyCategory} />
                )}
                {c.propertyType && (
                  <Chip icon={<Home size={9} />} label={c.propertyType} />
                )}
                {c.totalAreaSqYd != null && (
                  <Chip icon={<Maximize2 size={9} />} label={`${c.totalAreaSqYd} sq.yd`} />
                )}
                {c.pricePerSqYd != null && (
                  <Chip icon={<IndianRupee size={9} />} label={`₹${c.pricePerSqYd}/sq.yd`} />
                )}
              </div>
            </div>

            {/* Footer: date + mark read hint */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-[#B0B0B0]">
                <CalendarIcon /> {formatDate(c.created_at)}
              </p>
              {!isRead && !isPending && (
                <p className="text-[10px] text-blue-400">
                  Click anywhere to mark as read
                </p>
              )}
              {isPending && (
                <p className="text-[10px] text-[#B0B0B0]">Marking read...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── SMALL HELPERS ───────────────────────────────────
function CalendarIcon() {
  return (
    <span className="inline-flex items-center gap-1">
      <Clock size={9} className="inline" />
    </span>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F7] text-[#3A3A3A] border border-[#EDEDED]">
      {icon}{label}
    </span>
  );
}

function FilterSelect({ label, icon, value, onChange, options }: {
  label: string; icon: React.ReactNode;
  value: string; onChange: (v: string) => void; options: string[];
}) {
  const active = value !== "ALL";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-7 pr-7 py-1.5 rounded-full border text-xs font-semibold appearance-none cursor-pointer transition-all ${
          active
            ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
            : "bg-[#F7F7F7] text-[#3A3A3A] border-[#EDEDED] hover:border-[#B0B0B0]"
        }`}
      >
        <option value="ALL">All {label}s</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${active ? "text-white" : "text-[#B0B0B0]"}`}>
        {icon}
      </div>
    </div>
  );
}