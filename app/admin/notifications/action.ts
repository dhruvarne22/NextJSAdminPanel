"use server";

import { sendNotification } from "@/lib/sendnotification";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Supabase admin client (server-side only — uses service-role key
// to bypass RLS for inserts on behalf of users)
// ─────────────────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Resolve target uids — for "all" target, fetch every user with
// an fcm_token; for "uids" target, use the provided list as-is.
// ─────────────────────────────────────────────────────────────
async function resolveRecipientUids(
  target: "all" | "selected",
  uids: string[]
): Promise<string[]> {
  if (target === "selected") return uids;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .not("fcm_token", "is", null);

  if (error) {
    console.error("[sendNotificationAction] Failed to fetch users:", error);
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
}

// ─────────────────────────────────────────────────────────────
// Bulk-insert one notification row per recipient. We chunk in
// batches of 500 so very large broadcasts don't blow past
// Supabase's request limits.
// ─────────────────────────────────────────────────────────────
async function persistNotifications(params: {
  recipientUids: string[];
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown>;
}): Promise<{ inserted: number; failed: number }> {
  const { recipientUids, title, body, type, data } = params;

  if (recipientUids.length === 0) {
    return { inserted: 0, failed: 0 };
  }

  const rows = recipientUids.map((uid) => ({
    user_id: uid,
    title,
    body,
    type,
    data,
    is_read: false,
  }));

  const CHUNK = 500;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error, count } = await supabaseAdmin
      .from("notifications")
      .insert(slice, { count: "exact" });

    if (error) {
      console.error(
        `[sendNotificationAction] Insert chunk ${i / CHUNK} failed:`,
        error
      );
      failed += slice.length;
    } else {
      inserted += count ?? slice.length;
    }
  }

  return { inserted, failed };
}

// ─────────────────────────────────────────────────────────────
// MAIN ACTION
// ─────────────────────────────────────────────────────────────
export async function sendNotificationAction(
  _prev: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const title   = (formData.get("title")   as string ?? "").trim();
  const body    = (formData.get("body")    as string ?? "").trim();
  const target  = (formData.get("target")  as string ?? "all"); // "all" | "selected"
  const uidsRaw = (formData.get("uids")    as string ?? "");

  if (!title) return { success: false, message: "Title is required." };
  if (!body)  return { success: false, message: "Message body is required." };

  // Parse selected uids early since both FCM call and DB persist need them
  const selectedUids = uidsRaw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  if (target === "selected" && selectedUids.length === 0) {
    return { success: false, message: "Select at least one user." };
  }

  // Build FCM target shape
  const notifTarget: Parameters<typeof sendNotification>[0]["target"] =
    target === "all"
      ? { type: "all" }
      : { type: "uids", uids: selectedUids };

  const notifType = "admin_broadcast";
  const extraData = { type: notifType };

  // ── Step 1: Send via FCM ───────────────────────────────────────
  const result = await sendNotification({
    target: notifTarget,
    title,
    body,
    data: extraData,
  });

  // ── Step 2: Persist to Supabase ────────────────────────────────
  // Even when some FCM sends fail, every targeted user still gets
  // a DB row so the notification appears in their in-app history.
  let dbResult = { inserted: 0, failed: 0 };
  try {
    const recipientUids = await resolveRecipientUids(
      target as "all" | "selected",
      selectedUids
    );
    dbResult = await persistNotifications({
      recipientUids,
      title,
      body,
      type: notifType,
      data: extraData,
    });
  } catch (e) {
    console.error("[sendNotificationAction] DB persist threw:", e);
    // Don't fail the whole action just because DB write had issues —
    // FCM may still have delivered. We surface this in the message below.
  }

  // ── Step 3: Compose the response message ───────────────────────
  if (result.failed > 0 && result.sent === 0 && dbResult.inserted === 0) {
    return {
      success: false,
      message: `Failed to send to all ${result.failed} device(s).`,
    };
  }

  const fcmMsg =
    target === "all"
      ? `Sent to ${result.sent} device(s)${result.failed > 0 ? `, ${result.failed} failed` : ""}`
      : `Sent to ${result.sent} of ${result.sent + result.failed} selected user(s)`;

  const dbMsg =
    dbResult.inserted > 0
      ? ` • Saved ${dbResult.inserted} to history${dbResult.failed > 0 ? ` (${dbResult.failed} failed)` : ""}.`
      : dbResult.failed > 0
        ? ` • History save failed.`
        : ".";

  return {
    success: true,
    message: fcmMsg + dbMsg,
  };
}