"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/middleware";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const username = (formData.get("username") as string ?? "").trim();
  const password = (formData.get("password") as string ?? "").trim();
  const from     = (formData.get("from")     as string ?? "/admin").trim();

  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  const secret    = process.env.ADMIN_SESSION_SECRET;

  if (!validUser || !validPass || !secret) {
    return { error: "Server misconfiguration: missing env variables." };
  }

  if (username !== validUser || password !== validPass) {
    return { error: "Incorrect username or password." };
  }

  // Set httpOnly session cookie
  const jar = await cookies();
  jar.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,   // 7 days
    path:     "/",
  });

  // Redirect back to the protected page they came from
  const dest = from.startsWith("/admin") ? from : "/admin";
  redirect(dest);
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/admin/login");
}