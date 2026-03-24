"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "images";
const FOLDER = "investment";

// ── List all images in the investment folder ───────────────────────────────
export async function listInvestmentImages(): Promise<string[]> {
  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .list(FOLDER, { sortBy: { column: "created_at", order: "desc" } });

  if (error) throw new Error(error.message);

  const files = (data ?? []).filter(
    (f) => !f.name.startsWith(".") && (f.metadata?.size ?? 1) > 0
  );

  return files.map((f) =>
    supabaseServer.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`).data.publicUrl
  );
}

// ── Upload one image to the investment folder ──────────────────────────────
export async function uploadInvestmentImage(formData: FormData): Promise<string> {
  const file = formData.get("image") as File | null;
  if (!file) throw new Error("No file provided");

  // Sanitise filename and make unique
  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path     = `${FOLDER}/${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/investment-images");

  return supabaseServer.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ── Delete one image from the investment folder ────────────────────────────
export async function deleteInvestmentImage(publicUrl: string): Promise<void> {
  // Extract the storage path from the public URL
  // Public URLs look like: .../storage/v1/object/public/<bucket>/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx    = publicUrl.indexOf(marker);
  if (idx === -1) throw new Error("Could not parse storage path from URL");

  const storagePath = decodeURIComponent(publicUrl.slice(idx + marker.length));

  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/investment-images");
}