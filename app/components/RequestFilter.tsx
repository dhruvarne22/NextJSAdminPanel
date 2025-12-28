"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUS_MAP, PropertyStatus } from "@/lib/status";

type Property = {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  status: PropertyStatus;
};

type FilterStatus = "ALL" | PropertyStatus;

export default function RequestsListWithFilter({
  properties,
}: {
  properties: Property[];
}) {
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const filteredProperties =
    filter === "ALL"
      ? properties
      : properties.filter((p) => p.status === filter);

  return (
    <div className="space-y-4">
      {/* ===== STATUS FILTER ===== */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          All
        </FilterButton>

        {(["W", "Y", "N"] as PropertyStatus[]).map((status) => (
          <FilterButton
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
          >
            {STATUS_MAP[status].label}
          </FilterButton>
        ))}
      </div>

      {/* ===== REQUEST LIST ===== */}
      <div className="bg-white rounded shadow divide-y">
        {filteredProperties.map((p) => (
          <Link
            key={p.id}
            href={`/admin/properties/${p.id}`}
            className="block hover:bg-gray-50"
          >
            <div className="flex justify-between items-center p-4">
              <div>
                <p className="font-semibold">{p.name ?? "Unnamed Property"}</p>
                <p className="text-sm text-gray-500">{p.location ?? "-"}</p>
                <p className="text-sm">₹ {p.totalCost ?? "-"}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded
                  ${STATUS_MAP[p.status].bg}
                  ${STATUS_MAP[p.status].text}
                `}
              >
                {STATUS_MAP[p.status].label}
              </span>
            </div>
          </Link>
        ))}

        {filteredProperties.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No requests for this status
          </p>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded border
        ${
          active
            ? "bg-black text-white"
            : "bg-background hover:bg-muted"
        }
      `}
    >
      {children}
    </button>
  );
}
