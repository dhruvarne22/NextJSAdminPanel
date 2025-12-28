"use client";

import Link from "next/link";
import Image from "next/image";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  images: string | null;
};

export default function ApprovedPropertiesByCategory({
  grouped,
}: {
  grouped: Record<string, Property[]>;
}) {
  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, properties]) => (
        <div key={category} className="space-y-4">
          {/* ===== CATEGORY HEADER ===== */}
          <h2 className="text-xl font-semibold">{category}</h2>

          {/* ===== CARD GRID ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const images = p.images ? JSON.parse(p.images) : [];
              const cover = images[0];

              return (
                <Link
                  key={p.id}
                  href={`/admin/properties/${p.id}`}
                  className="border rounded-lg overflow-hidden hover:shadow transition"
                >
                  {/* Image */}
                  <div className="relative h-40 bg-muted">
                    {cover && (
                      <Image
                        src={cover}
                        alt="Property image"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-1">
                    <p className="font-medium">
                      {p.name ?? "Unnamed Property"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.location ?? "-"}
                    </p>
                    <p className="text-sm font-semibold">
                      ₹ {p.totalCost ?? "-"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {properties.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No approved properties in this category
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
