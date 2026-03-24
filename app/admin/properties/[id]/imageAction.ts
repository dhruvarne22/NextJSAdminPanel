"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Update the images array in the DB ─────────────────────────────────────────
export async function updatePropertyImages(
  propertyId: number,
  images: string[]
) {
  const { error } = await supabaseServer
    .from("properties")
    .update({ images: JSON.stringify(images) })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties`);
}

// ── Upload a new image to Supabase Storage + save URL ────────────────────────
export async function uploadPropertyImage(
  propertyId: number,
  formData: FormData,
  currentImages: string[]
): Promise<string> {
  const file = formData.get("image") as File;
  if (!file) throw new Error("No file provided");

  const ext      = file.name.split(".").pop() ?? "jpg";
  const fileName = `property_${propertyId}_${Date.now()}.${ext}`;
  const bytes    = await file.arrayBuffer();

  const { error: uploadError } = await supabaseServer.storage
    .from("property-media")
    .upload(fileName, bytes, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabaseServer.storage
    .from("property-media")
    .getPublicUrl(fileName);

  const newUrl    = urlData.publicUrl;
  const newImages = [...currentImages, newUrl];

  await updatePropertyImages(propertyId, newImages);

  return newUrl;
}

// ── Delete one image from Storage + remove from DB ───────────────────────────
export async function deletePropertyImage(
  propertyId: number,
  imageUrl: string,
  currentImages: string[]
) {
  // Extract filename from URL to delete from storage
  try {
    const url      = new URL(imageUrl);
    const parts    = url.pathname.split("/");
    const fileName = parts[parts.length - 1];

    // Best-effort delete from storage (don't fail if already missing)
    await supabaseServer.storage
      .from("property-media")
      .remove([fileName]);
  } catch {
    // URL parsing failed — skip storage delete, still remove from DB
  }

  const newImages = currentImages.filter((img) => img !== imageUrl);
  await updatePropertyImages(propertyId, newImages);
}