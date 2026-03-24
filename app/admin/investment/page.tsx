// app/admin/investment-images/page.tsx
import Link from "next/link";
import { ArrowLeft, TrendingUp, FolderOpen } from "lucide-react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { listInvestmentImages } from "./action";
import InvestmentImagesManager from "./investmentimgmanager";

export const dynamic = "force-dynamic"; // always fresh — no cache

export default async function InvestmentImagesPage() {
  let images: string[] = [];
  let fetchError: string | null = null;

  try {
    images = await listInvestmentImages();
  } catch (err: any) {
    fetchError = err.message ?? "Failed to load images";
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      

      <main className="flex-1 overflow-auto">

        {/* ── TOP BAR ───────────────────────────────────────────────────── */}
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
                  Admin · Storage
                </p>
                <h1 className="text-lg font-bold text-[#0D0D0D] tracking-tight leading-none">
                  Investment Images
                </h1>
              </div>
            </div>

            {/* Folder pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F7] border border-[#EDEDED] rounded-full">
              <FolderOpen size={13} className="text-[#B0B0B0]" />
              <span className="text-xs font-medium text-[#3A3A3A]">
                images / investment
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-6xl space-y-6">

          {/* ── HERO BANNER ─────────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[#0D0D0D] p-7 text-white"
            style={{ minHeight: 150 }}
          >
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/[0.03] blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[#B0B0B0] text-xs tracking-widest uppercase font-medium">
                      Supabase Storage
                    </p>
                    <h2
                      className="text-xl font-bold tracking-tight"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Investment Folder
                    </h2>
                  </div>
                </div>
                <p className="text-[#B0B0B0] text-sm max-w-lg leading-relaxed">
                  Images uploaded here appear in the{" "}
                  <span className="text-white font-medium">Investment</span> category
                  banner carousel in the mobile app. Upload, preview, or remove images below.
                </p>
              </div>

              {/* Count bubble */}
              <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-4xl font-bold tracking-tighter">{images.length}</span>
                <span className="text-[#B0B0B0] text-xs">
                  {images.length === 1 ? "image" : "images"}
                </span>
              </div>
            </div>
          </div>

          {/* ── ERROR STATE ─────────────────────────────────────────────── */}
          {fetchError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Failed to load images</p>
                <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>
              </div>
            </div>
          ) : (
            /* ── MANAGER ────────────────────────────────────────────────── */
            <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 shadow-sm">
              <InvestmentImagesManager initialImages={images} />
            </div>
          )}

          {/* ── INFO FOOTER ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-4 text-xs text-[#B0B0B0]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0B0B0]" />
              Images are stored in Supabase bucket{" "}
              <code className="bg-[#EDEDED] text-[#3A3A3A] px-1 py-0.5 rounded font-mono">
                images/investment
              </code>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0B0B0]" />
              Changes are reflected in the mobile app immediately
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0B0B0]" />
              Max 20 images recommended
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}