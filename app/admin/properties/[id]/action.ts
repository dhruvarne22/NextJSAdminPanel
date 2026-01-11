"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { PropertyStatus } from "@/lib/types";

/* ==============================
   UPDATE PROPERTY STATUS
================================ */
export async function updatePropertyStatus(
  propertyId: number,
  newStatus: PropertyStatus,
  comment: string
) {
  if (!comment || comment.trim().length < 3) {
    throw new Error("Comment is mandatory");
  }

  const { data: property } = await supabaseServer
    .from("properties")
    .select("status")
    .eq("id", propertyId)
    .single();

  if (!property) throw new Error("Property not found");

  await supabaseServer
    .from("properties")
    .update({ status: newStatus })
    .eq("id", propertyId);

  await supabaseServer.from("property_activity_log").insert({
    property_id: propertyId,
    from_status: property.status,
    to_status: newStatus,
    comment,
    activity_type: "STATUS_CHANGE",
    admin_uid: "admin",
  });
}

/* ==============================
   UPDATE PROPERTY HIGHLIGHTS
================================ */
export async function updatePropertyHighlights(
  propertyId: number,
  highlights: string[]
) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    throw new Error("At least one highlight is required");
  }

  await supabaseServer
    .from("properties")
    .update({ highlights })
    .eq("id", propertyId);

  await supabaseServer.from("property_activity_log").insert({
    property_id: propertyId,
    comment: `Updated ${highlights.length} highlights`,
    activity_type: "HIGHLIGHTS_UPDATE",
    admin_uid: "admin",
  });
}

/* ==============================
   UPDATE ABOUT PROPERTY
================================ */
export async function updatePropertyAbout(
  propertyId: number,
  aboutProperty: string
) {
  if (!aboutProperty || aboutProperty.trim().length < 10) {
    throw new Error("About Property content is too short");
  }

  await supabaseServer
    .from("properties")
    .update({ about_property: aboutProperty })
    .eq("id", propertyId);

  await supabaseServer.from("property_activity_log").insert({
    property_id: propertyId,
    comment: "Updated About Property content",
    activity_type: "ABOUT_UPDATE",
    admin_uid: "admin",
  });
}
