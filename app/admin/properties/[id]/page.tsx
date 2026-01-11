import { supabaseServer } from "@/lib/supabase/server";

import Image from "next/image";
import StatusUpdateForm from "./StatusForm";
import StatusBadge from "@/app/components/StatusBadge";
import { notFound } from "next/navigation";
import { PropertyStatus, STATUS_MAP } from "@/lib/status";
import PropertyMediaSlider from "@/app/components/PropertyMediaSlider";
import PropertyHighlightsForm from "./PropertyHighlight";
import PropertyAboutForm from "./PropertyAboutForm";

export default async function PropertyDetailPage({
  params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
  const propertyId = parseInt(id, 10);

  const { data: property } = await supabaseServer
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (!property) {
    notFound(); // ⬅️ THIS IS THE FIX
  }

const { data: activityLogs } = await supabaseServer
  .from("property_activity_log")
  .select("*")
  .eq("property_id", propertyId)
  .order("created_at", { ascending: false });

  if (!property) return <p>Property not found `${propertyId}` </p>;

  const images = property.images ? JSON.parse(property.images) : [];

  return (
    <div className="space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{property.name}</h1>
        <StatusBadge status={property.status} />
      </div>

 <PropertyMediaSlider
  images={images}
  youtubeVideo={property.youtubeVideo}
/>

      {/* ===== DETAILS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded border">
        <Detail label="Location" value={property.location} />
        <Detail label="Category" value={property.propertyCategory} />
        <Detail label="Type" value={property.propertyType} />
        <Detail label="Facing" value={property.facing} />
        <Detail label="Area (Sq Yd)" value={property.totalAreaSqYd} />
        <Detail label="Total Cost" value={`₹ ${property.totalCost}`} />
      </div>


{/* ===== PROPERTY CONTENT ===== */}
<PropertyHighlightsForm
  propertyId={propertyId}
  initialHighlights={property.highlights}
/>

<PropertyAboutForm

  propertyId={propertyId}
  initialValue={property.about_property}
/>



      {/* ===== STATUS ACTION ===== */}
      <StatusUpdateForm
        propertyId={propertyId}
        currentStatus={property.status}
      />

{/* ===== ACTIVITY / ADMIN COMMENTS ===== */}
<div className="bg-background p-4 rounded border space-y-3">
  <h3 className="font-semibold">Admin Activity</h3>

  {activityLogs?.map((log) => (
    <div key={log.id} className="text-sm border-b pb-2 space-y-1">
      {/* Status change info (if any) */}
      {log.activity_type === "STATUS_CHANGE" && (
     <p className="text-xs text-muted-foreground">
  Status:{" "}
  {log.from_status
    ? STATUS_MAP[log.from_status as PropertyStatus].label
    : "—"}
  {" → "}
  {log.to_status
    ? STATUS_MAP[log.to_status as PropertyStatus].label
    : "—"}
</p>
      )}

      {/* Comment */}
      <p>{log.comment}</p>

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        {new Date(log.created_at).toLocaleString()}
      </p>
    </div>
  ))}

  {activityLogs?.length === 0 && (
    <p className="text-sm text-muted-foreground">
      No admin activity yet
    </p>
  )}
</div>

    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}
