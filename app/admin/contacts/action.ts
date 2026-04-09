"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Mark one contact row as read */
export async function markContactRead(id: string) {
  await supabaseServer
    .from("property_intrested")
    .update({ is_read: true })
    .eq("id", id);
  revalidatePath("/admin/contacts");
}

/** Mark ALL contacts as read */
export async function markAllContactsRead() {
  await supabaseServer
    .from("property_intrested")
    .update({ is_read: true })
    .eq("is_read", false);
  revalidatePath("/admin/contacts");
}