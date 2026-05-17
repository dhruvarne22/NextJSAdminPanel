"use server";

import { sendNotification } from "@/lib/sendnotification";
import { supabaseServer } from "@/lib/supabase/server";

import { revalidatePath } from "next/cache";

/* ==============================
   UPDATE PROPERTY STATUS
================================ */
export async function updatePropertyStatus(
  propertyId: number,
  status: string,
  comment: string
) {
  // 1. Update status in DB
  await supabaseServer
    .from("properties")
    .update({ status, admin: comment })
    .eq("id", propertyId);

  // 2. Log activity
  await supabaseServer.from("property_activity_log").insert({
    property_id:   propertyId,
    activity_type: "STATUS_CHANGE",
    to_status:     status,
    comment:       comment,
  });

  // 3. Fetch property details for notification
  const { data: property } = await supabaseServer
    .from("properties")
    .select("name, uid")
    .eq("id", propertyId)
    .single();

  if (property) {

    if (status === "Y") {
      // Approved → notify ALL users
      await sendNotification({
        target: { type: "all" },
        title:  "New Property Available 🏠",
        body:   `${property.name} is now live on Vardaan!`,
        data:   { type: "property_approved", property_id: String(propertyId) },
      });


         await sendNotification({
        target: { type: "uid", uid: property.uid },
        title:  "Property Approved!",
        body:   `Your ${property.name} is live on Vardaan.`,
        data:   { type: "property_rejected", property_id: String(propertyId) },
      });
    }

    if (status === "N") {
      // Rejected → notify only the owner
      await sendNotification({
        target: { type: "uid", uid: property.uid },
        title:  "Property Update Required",
        body:   "Your listing needs changes. Tap to view admin feedback.",
        data:   { type: "property_rejected", property_id: String(propertyId) },
      });
    }


        if (status === "W") {
      // Rejected → notify only the owner
      await sendNotification({
        target: { type: "uid", uid: property.uid },
        title:  `${property.name} - Status Changed`,
        body:   "Your listing went to WAITING status. Tap to view admin feedback.",
        data:   { type: "property_rejected", property_id: String(propertyId) },
      });
    }

  }

  // 4. Revalidate pages
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
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
