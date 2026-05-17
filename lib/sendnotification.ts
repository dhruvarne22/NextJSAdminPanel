"use server";

import { supabaseServer } from "@/lib/supabase/server";

// ─────────────────────────── CONFIG ──────────────────────────────────────────
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;
const FCM_URL    = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

// ─────────────────────────── TYPES ───────────────────────────────────────────
export type NotificationTarget =
  | { type: "all" }                        // every user with a token
  | { type: "uid";    uid: string }        // single user by uid
  | { type: "uids";   uids: string[] }     // multiple users by uid
  | { type: "token";  token: string }      // single raw FCM token
  | { type: "tokens"; tokens: string[] };  // multiple raw FCM tokens

export interface SendNotificationOptions {
  target:  NotificationTarget;
  title:   string;
  body:    string;
  data?:   Record<string, string>;         // extra key-value pairs for the app
  imageUrl?: string;                       // optional image in notification
}

export interface NotificationResult {
  sent:   number;
  failed: number;
  errors: string[];
}

// ─────────────────────────── ACCESS TOKEN ────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  const { GoogleAuth } = await import("google-auth-library");

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const result = await client.getAccessToken();
  return result.token!;
}

// ─────────────────────────── SEND ONE TOKEN ──────────────────────────────────
async function sendToToken(
  accessToken: string,
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<void> {
  const message: Record<string, any> = {
    token: fcmToken,
    notification: { title, body, ...(imageUrl ? { image: imageUrl } : {}) },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      ...data,
    },
    android: {
      priority: "high",
      notification: {
        channel_id: "property_updates",
        sound:      "default",
      
        visibility: "PUBLIC",
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
      ...(imageUrl ? { fcm_options: { image: imageUrl } } : {}),
    },
  };

  const res = await fetch(FCM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

// ─────────────────────────── RESOLVE TOKENS ──────────────────────────────────
async function resolveTokens(target: NotificationTarget): Promise<string[]> {
  switch (target.type) {

    case "all": {
      const { data } = await supabaseServer
        .from("users")
        .select("fcm_token")
        .not("fcm_token", "is", null);
      return (data ?? []).map((u: any) => u.fcm_token).filter(Boolean);
    }

    case "uid": {
      const { data } = await supabaseServer
        .from("users")
        .select("fcm_token")
        .eq("id", target.uid)
        .not("fcm_token", "is", null)
        .limit(1);
      return (data ?? []).map((u: any) => u.fcm_token).filter(Boolean);
    }

    case "uids": {
      const { data } = await supabaseServer
        .from("users")
        .select("fcm_token")
        .in("id", target.uids)
        .not("fcm_token", "is", null);
      return (data ?? []).map((u: any) => u.fcm_token).filter(Boolean);
    }

    case "token":
      return [target.token];

    case "tokens":
      return target.tokens.filter(Boolean);

    default:
      return [];
  }
}

// ─────────────────────────── MAIN FUNCTION ───────────────────────────────────
export async function sendNotification(
  options: SendNotificationOptions
): Promise<NotificationResult> {
  const result: NotificationResult = { sent: 0, failed: 0, errors: [] };

  try {
    const tokens = await resolveTokens(options.target);

    if (tokens.length === 0) {
      console.log("📭 [FCM] No tokens found for target:", options.target);
      return result;
    }

    console.log(`📤 [FCM] Sending "${options.title}" to ${tokens.length} device(s)`);

    const accessToken = await getAccessToken();

    const results = await Promise.allSettled(
      tokens.map((token) =>
        sendToToken(
          accessToken,
          token,
          options.title,
          options.body,
          options.data,
          options.imageUrl,
        )
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        result.sent++;
      } else {
        result.failed++;
        result.errors.push(r.reason?.message ?? String(r.reason));
      }
    }

    console.log(`✅ [FCM] Sent: ${result.sent} | Failed: ${result.failed}`);
    if (result.errors.length) {
      console.warn("⚠️  [FCM] Errors:", result.errors.slice(0, 3));
    }

  } catch (e: any) {
    console.error("💥 [FCM] Fatal error:", e);
    result.errors.push(e.message ?? String(e));
  }

  return result;
}