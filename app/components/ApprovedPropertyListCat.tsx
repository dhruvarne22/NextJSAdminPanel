"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  MapPin, IndianRupee, ArrowRight, Home, Building2,
  Factory, Wheat, TrendingUp, LayoutGrid, List,
  ChevronDown, ChevronUp
} from "lucide-react";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  images: string | null;
};

// ─────────────────────────── HELPERS ─────────────────────────────────────────
function formatPrice(n: number | null): string {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function getCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("residential"))  return <Home size={15} />;
  if (c.includes("commercial"))   return <Building2 size={15} />;
  if (c.includes("industrial"))   return <Factory size={15} />;
  if (c.includes("agricultural")) return <Wheat size={15} />;
  if (c.includes("investment"))   return <TrendingUp size={15} />;
  return <Building2 size={15} />;
}

// ─────────────────────────── MAIN COMPONENT ──────────────────────────────────
export default function ApprovedPropertiesByCategory({
  grouped,
}: {
  grouped: Record<string, Property[]>;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = Object.entries(grouped);

  if (categories.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* ── Global view mode toggle ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#B0B0B0]">
          {categories.length} {categories.length === 1 ? "category" : "categories"} · {" "}
          {Object.values(grouped).reduce((s, a) => s + a.length, 0)} properties
        </p>
        <div className="flex items-center bg-[#F7F7F7] border border-[#EDEDED] rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-[#0D0D0D] text-white shadow-sm"
                : "text-[#B0B0B0] hover:text-[#0D0D0D]"
            }`}
          >
            <LayoutGrid size={12} />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-[#0D0D0D] text-white shadow-sm"
                : "text-[#B0B0B0] hover:text-[#0D0D0D]"
            }`}
          >
            <List size={12} />
            List
          </button>
        </div>
      </div>

      {/* ── Category sections ───────────────────────────────────────── */}
      {categories.map(([category, properties]) => (
        <CategorySection
          key={category}
          category={category}
          properties={properties}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

// ─────────────────────────── CATEGORY SECTION ────────────────────────────────
function CategorySection({
  category, properties, viewMode,
}: {
  category: string;
  properties: Property[];
  viewMode: "grid" | "list";
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">

      {/* Category header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#EDEDED] hover:bg-[#F7F7F7] transition-colors group"
      >
        <div className="flex items-center gap-3">
          {/* Category icon */}
          <div className="w-8 h-8 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(category)}
          </div>
          <div className="text-left">
            <h2 className="font-bold text-[#0D0D0D] text-sm tracking-tight">
              {category}
            </h2>
            <p className="text-[10px] text-[#B0B0B0]">
              {properties.length} approved {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#F7F7F7] border border-[#EDEDED] text-[#B0B0B0] text-xs font-bold px-2.5 py-1 rounded-full">
            {properties.length}
          </span>
          {collapsed
            ? <ChevronDown size={15} className="text-[#B0B0B0]" />
            : <ChevronUp size={15} className="text-[#B0B0B0]" />
          }
        </div>
      </button>

      {/* Properties */}
      {!collapsed && (
        <div className={viewMode === "grid" ? "p-5" : ""}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => (
                <GridCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[#F7F7F7]">
              {properties.map((p) => (
                <ListRow key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── GRID CARD ───────────────────────────────────────
function GridCard({ property: p }: { property: Property }) {
  const images = p.images ? JSON.parse(p.images) : [];
  const cover  = images[0];

  return (
    <Link
      href={`/admin/properties/${p.id}`}
      className="group rounded-xl overflow-hidden border border-[#EDEDED] hover:border-[#0D0D0D]/20 hover:shadow-md transition-all bg-white"
    >
      {/* Image */}
      <div className="relative h-40 bg-[#F7F7F7] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={p.name ?? "Property"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={28} className="text-[#B0B0B0]" />
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-md">
          <ArrowRight size={13} className="text-[#0D0D0D]" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-[#0D0D0D] text-sm truncate leading-tight">
          {p.name ?? "Unnamed Property"}
        </p>

        {p.location && (
          <div className="flex items-center gap-1.5 text-[#B0B0B0]">
            <MapPin size={11} />
            <span className="text-xs truncate">{p.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[#F7F7F7]">
          <div className="flex items-center gap-1 text-[#0D0D0D]">
            <span className="text-sm font-bold">{formatPrice(p.totalCost)}</span>
          </div>
          <span className="text-[10px] text-[#B0B0B0] bg-[#F7F7F7] px-2 py-0.5 rounded-full border border-[#EDEDED]">
            #{p.id}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────── LIST ROW ────────────────────────────────────────
function ListRow({ property: p }: { property: Property }) {
  const images = p.images ? JSON.parse(p.images) : [];
  const cover  = images[0];

  return (
    <Link
      href={`/admin/properties/${p.id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-[#F7F7F7] transition-colors group"
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F7F7F7] flex-shrink-0">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={16} className="text-[#B0B0B0]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D0D0D] truncate">
          {p.name ?? "Unnamed Property"}
        </p>
        {p.location && (
          <div className="flex items-center gap-1 mt-0.5 text-[#B0B0B0]">
            <MapPin size={10} />
            <span className="text-xs truncate">{p.location}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="hidden sm:block text-right flex-shrink-0">
        <p className="text-sm font-bold text-[#0D0D0D]">{formatPrice(p.totalCost)}</p>
        <p className="text-[10px] text-[#B0B0B0]">total cost</p>
      </div>

      {/* ID + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-[#B0B0B0] hidden md:block">#{p.id}</span>
        <ArrowRight
          size={14}
          className="text-[#EDEDED] group-hover:text-[#B0B0B0] group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
}