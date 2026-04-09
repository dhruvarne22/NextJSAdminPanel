"use client";

import { logoutAction } from "@/app/admin/login/action";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#B0B0B0] hover:bg-white/[0.07] hover:text-white transition-all text-sm font-medium"
      >
        <LogOut size={15} className="text-[#B0B0B0]" />
        Sign Out
      </button>
    </form>
  );
}