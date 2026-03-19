"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  LayoutDashboard, InboxIcon, Building2, Menu,
  ShieldCheck, ChevronRight
} from "lucide-react";
import { useState } from "react";

// ─────────────────────────── NAV CONFIG ──────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",  href: "/admin",             icon: LayoutDashboard },
  { label: "Requests",   href: "/admin/requests",    icon: InboxIcon       },
  { label: "Properties", href: "/admin/properties",  icon: Building2       },
];

// ─────────────────────────── SIDEBAR CONTENT ─────────────────────────────────
function SidebarContent({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-white select-none">

      {/* ── BRAND ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-[#0D0D0D] font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>
            V
          </span>
        </div>
        <div>
          <p className="text-white font-bold tracking-widest text-sm">VARDAAN</p>
          <p className="text-[#B0B0B0] text-[10px] tracking-wide">Admin Panel</p>
        </div>
      </div>

      {/* ── NAV LABEL ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-semibold tracking-widest text-[#B0B0B0]/60 uppercase">
          Navigation
        </p>
      </div>

      {/* ── NAV ITEMS ─────────────────────────────────────────────────── */}
      <nav className="px-3 space-y-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon   = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-white text-[#0D0D0D] shadow-sm"
                  : "text-[#B0B0B0] hover:bg-white/[0.07] hover:text-white"
                }`}
            >
              <Icon
                size={16}
                className={active ? "text-[#0D0D0D]" : "text-[#B0B0B0] group-hover:text-white"}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight size={13} className="text-[#B0B0B0]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── BOTTOM: admin badge ───────────────────────────────────────── */}
      <div className="px-4 py-5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.05]">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={14} className="text-[#B0B0B0]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin</p>
            <p className="text-[10px] text-[#B0B0B0]">Full access</p>
          </div>
          {/* Online dot */}
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 ml-auto shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN EXPORT ─────────────────────────────────────
export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── MOBILE (sheet overlay) ───────────────────────────────────── */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center shadow-lg hover:bg-[#2a2a2a] transition-colors">
              <Menu size={17} />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64 border-0">
            <VisuallyHidden>
              <SheetTitle>Admin Navigation</SheetTitle>
            </VisuallyHidden>
            <div className="h-full">
              <SidebarContent onClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── DESKTOP ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}