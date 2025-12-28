"use client";

import { useState } from "react";

import { PropertyStatus } from "@/lib/types";
import { updatePropertyStatus } from "./action";

export default function StatusForm({
  propertyId,
  currentStatus,
}: {
  propertyId: number;
  currentStatus: PropertyStatus;
}) {
  const [status, setStatus] = useState<PropertyStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await updatePropertyStatus(propertyId, status, comment);
    window.location.reload();
  }

  return (
    <div className="border p-4 rounded space-y-3">
      <h3 className="font-semibold">Update Status</h3>

      <select
        className="border p-2 rounded w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value as PropertyStatus)}
      >
        <option value="W">Waiting</option>
        <option value="Y">Approve</option>
        <option value="N">Reject</option>
      </select>

      <textarea
        className="border p-2 rounded w-full"
        placeholder="Mandatory comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        disabled={loading || comment.trim().length < 3}
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Updating..." : "Submit"}
      </button>
    </div>
  );
}
