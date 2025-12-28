"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Requests", href: "/admin/requests" },
  { label: "Properties", href: "/admin/properties" },
];

function SidebarContent({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-background p-4">
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={`block rounded px-3 py-2 text-sm
                ${active ? "bg-muted font-medium" : "hover:bg-muted"}
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <p className="text-xs text-muted-foreground">
        Logged in as Admin
      </p>
    </aside>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== MOBILE SIDEBAR (OVERLAY) ===== */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-3 left-3 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

   <SheetContent side="left" className="p-0">
  {/* Accessibility title (required) */}
  <VisuallyHidden>
    <SheetTitle>Admin Navigation</SheetTitle>
  </VisuallyHidden>

  <SidebarContent onClick={() => setOpen(false)} />
</SheetContent>
        </Sheet>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:block w-64 border-r">
        <SidebarContent />
      </aside>
    </>
  );
}
