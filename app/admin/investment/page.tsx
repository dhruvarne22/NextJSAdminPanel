import { supabaseServer } from "@/lib/supabase/server";
import {
  listInvestmentImages,
  uploadInvestmentImage,
  deleteInvestmentImage,
} from "./action";
import InvestmentImageManager from "./investmentimgmanager";
import { ArrowLeft, Images, Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Investment Images" };

export default async function InvestmentImagesPage() {
  // 1. All images in storage
  const imageUrls = await listInvestmentImages().catch(() => [] as string[]);

  // 2. All interest rows, joined with user name + phone
  const { data: interests } = await supabaseServer
    .from("investment")
    .select(`
      id,
      created_at,
      image_url,
      user_id,
      users ( name, phone )
    `)
    .order("created_at", { ascending: false });

  // Group interests by image_url  →  { [url]: InterestRow[] }
  type InterestRow = {
    id: number;
    created_at: string;
    image_url: string;
    user_id: string;
    users: { name: string | null; phone: string | null } | null;
  };

  const interestMap: Record<string, InterestRow[]> = {};
  for (const row of (interests ?? []) as unknown as InterestRow[]) {
    if (!row.image_url) continue;
    if (!interestMap[row.image_url]) interestMap[row.image_url] = [];
    interestMap[row.image_url].push(row);
  }

  const totalInterests = (interests ?? []).length;

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
                Investment Images
              </h1>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F7] border border-[#EDEDED] rounded-full">
              <Images size={13} className="text-[#B0B0B0]" />
              <span className="text-xs font-semibold text-[#3A3A3A]">
                {imageUrls.length} photos
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0D] rounded-full">
              <Users size={13} className="text-white" />
              <span className="text-xs font-semibold text-white">
                {totalInterests} interested
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl">
        <InvestmentImageManager
          imageUrls={imageUrls}
          interestMap={interestMap}
          uploadAction={uploadInvestmentImage}
          deleteAction={deleteInvestmentImage}
        />
      </div>
    </div>
  );
}