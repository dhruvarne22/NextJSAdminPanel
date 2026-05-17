import { supabaseServer } from "@/lib/supabase/server";
import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import NotificationComposer from "./NotificationComposer";

export const metadata = { title: "Send Notification" };

export type UserRow = {
  id:        string;
  name:      string | null;
  phone:     string | null;
  fcm_token: string | null;
};

export default async function NotificationsPage() {
  // Fetch all users — show all but only those with tokens can receive
  const { data: users } = await supabaseServer
    .from("users")
    .select("id, name, phone, fcm_token")
    .order("name", { ascending: true });

  const allUsers: UserRow[] = (users ?? []).map((u: any) => ({
    id:        u.id,
    name:      u.name,
    phone:     u.phone,
    fcm_token: u.fcm_token,
  }));

  const withToken    = allUsers.filter((u) => u.fcm_token).length;
  const withoutToken = allUsers.length - withToken;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-30">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#B0B0B0] hover:text-[#0D0D0D] transition-colors">
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span className="text-[#EDEDED]">|</span>
            <div>
              <p className="text-xs text-[#B0B0B0] font-medium tracking-wider uppercase">Admin</p>
              <h1 className="text-lg font-bold text-[#0D0D0D] tracking-tight leading-none">
                Send Notification
              </h1>
            </div>
          </div>

          {/* Token stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0D] rounded-full">
              <Bell size={13} className="text-white" />
              <span className="text-xs font-semibold text-white">{withToken} reachable</span>
            </div>
            {withoutToken > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F7] border border-[#EDEDED] rounded-full">
                <span className="text-xs text-[#B0B0B0]">{withoutToken} no token</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl">
        <NotificationComposer users={allUsers} />
      </div>
    </div>
  );
}