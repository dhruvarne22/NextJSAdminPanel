import { supabaseServer } from "@/lib/supabase/server";

import { PropertyStatus } from "@/lib/status";
import ApprovedPropertiesByCategory from "@/app/components/ApprovedPropertyListCat";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  propertyCategory: string | null;
  status: PropertyStatus;
  images: string | null;
};

export default async function PropertiesPage() {
  const { data } = await supabaseServer
    .from("properties")
    .select(
      "id, name, location, totalCost, propertyCategory, status, images"
    )
    .eq("status", "Y") // ✅ ONLY APPROVED
    .order("createdAt", { ascending: false });

  const properties = (data ?? []) as Property[];

  // 🔹 Group by category
  const grouped = properties.reduce<Record<string, Property[]>>(
    (acc, property) => {
      const category = property.propertyCategory ?? "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(property);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Approved Properties</h1>

      <ApprovedPropertiesByCategory grouped={grouped} />
    </div>
  );
}
