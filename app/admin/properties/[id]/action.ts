"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { PropertyStatus } from "@/lib/types";

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
