import { supabaseServer } from "@/lib/supabase/server";
import { PropertyStatus } from "@/lib/status";
import ApprovedPropertiesByCategory from "@/app/components/ApprovedPropertyListCat";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  propertyCategory: string | null;
  status: PropertyStatus;
  images: string | null;
};

export default async function PropertiesPage() {
  const { data } = await supabaseServer
    .from("properties")
    .select("id, name, location, totalCost, propertyCategory, status, images")
    .eq("status", "Y")
    .order("createdAt", { ascending: false });

  const properties = (data ?? []) as Property[];

  // Group by category
  const grouped = properties.reduce<Record<string, Property[]>>((acc, p) => {
    const cat = p.propertyCategory ?? "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const categoryCount = Object.keys(grouped).length;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ── TOP BAR ───────────────────────────────────────────────── */}
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
                Approved Properties
              </h1>
            </div>
          </div>

          {/* Summary pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle2 size={13} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              {properties.length} approved · {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────── */}
      <div className="px-8 py-8 max-w-6xl">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EDEDED] flex items-center justify-center shadow-sm">
              <CheckCircle2 size={24} className="text-[#B0B0B0]" />
            </div>
            <p className="font-semibold text-[#0D0D0D]">No approved properties yet</p>
            <p className="text-sm text-[#B0B0B0]">Approved listings will appear here.</p>
            <Link
              href="/admin/requests"
              className="text-sm text-[#0D0D0D] underline underline-offset-2 hover:opacity-70 transition-opacity mt-1"
            >
              Review pending requests →
            </Link>
          </div>
        ) : (
          <ApprovedPropertiesByCategory grouped={grouped} />
        )}
      </div>
    </div>
  );
}