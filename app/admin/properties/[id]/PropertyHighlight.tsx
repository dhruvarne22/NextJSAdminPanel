"use client";

import { useState } from "react";
import { updatePropertyHighlights } from "./action";


export default function PropertyHighlightsForm({
  propertyId,
  initialHighlights,
}: {
  propertyId: number;
  initialHighlights: string[] | null;
}) {
  const [value, setValue] = useState(
    initialHighlights?.join("\n") ?? ""
  );
  const [loading, setLoading] = useState(false);

  async function saveHighlights() {
    setLoading(true);

    const highlights = value
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    // await supabaseBrowser
    //   .from("properties")
    //   .update({ highlights })
    //   .eq("id", propertyId);

    await updatePropertyHighlights(propertyId, highlights);

    setLoading(false);
    alert("Highlights saved");
  }

  return (
    <div className="bg-background p-4 rounded border space-y-3">
      <h3 className="font-semibold">Property Highlights</h3>

      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={5}
        placeholder="One highlight per line"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        onClick={saveHighlights}
        disabled={loading}
        className="px-4 py-2 text-sm rounded bg-primary text-white"
      >
        {loading ? "Saving..." : "Save Highlights"}
      </button>
    </div>
  );
}
