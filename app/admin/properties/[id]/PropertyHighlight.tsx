"use client";

import { useState } from "react";
import { updatePropertyHighlights } from "./action";
import { CheckCircle2, Lightbulb, Save, Trash2 } from "lucide-react";

export default function PropertyHighlightsForm({
  propertyId,
  initialHighlights,
}: {
  propertyId: number;
  initialHighlights: string[] | null;
}) {
  const [value, setValue]     = useState(initialHighlights?.join("\n") ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);

  // Live preview — non-empty lines
  const preview = value.split("\n").map((h) => h.trim()).filter(Boolean);

  async function saveHighlights() {
    setLoading(true);
    await updatePropertyHighlights(propertyId, preview);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function clear() {
    setValue("");
    setSaved(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center">
            <Lightbulb size={13} className="text-white" />
          </div>
          <h3 className="font-semibold text-[#0D0D0D] text-sm">Property Highlights</h3>
        </div>
        {preview.length > 0 && (
          <span className="text-xs text-[#B0B0B0] bg-[#F7F7F7] px-2 py-0.5 rounded-full border border-[#EDEDED]">
            {preview.length} item{preview.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 bg-[#F7F7F7] border border-[#EDEDED] rounded-xl p-3">
        <div className="w-1 h-full min-h-[16px] rounded-full bg-[#0D0D0D] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#B0B0B0] leading-relaxed">
          Enter each highlight on a new line. Each line becomes a separate bullet point in the app.
        </p>
      </div>

      {/* Two-column: textarea + live preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#B0B0B0] uppercase tracking-wide">
            Input
          </label>
          <textarea
            className="w-full border border-[#EDEDED] rounded-xl p-3 text-sm text-[#0D0D0D] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 focus:border-[#0D0D0D] transition-all placeholder:text-[#B0B0B0] font-mono"
            rows={7}
            placeholder={"Corner plot\nApproved layout\n24/7 security\nNear highway"}
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          />
        </div>

        {/* Live preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#B0B0B0] uppercase tracking-wide">
            Preview
          </label>
          <div className="border border-[#EDEDED] rounded-xl p-3 bg-[#F7F7F7] min-h-[164px]">
            {preview.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[140px] text-[#B0B0B0] text-xs">
                Start typing to see preview
              </div>
            ) : (
              <ul className="space-y-2">
                {preview.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[#0D0D0D] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={11} className="text-white" />
                    </div>
                    <span className="text-sm text-[#0D0D0D] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={saveHighlights}
          disabled={loading || preview.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D0D0D] text-white text-sm font-medium hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Save size={14} />
          {loading ? "Saving..." : saved ? "Saved ✓" : "Save Highlights"}
        </button>

        {value && (
          <button
            onClick={clear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#EDEDED] text-sm text-[#B0B0B0] hover:text-[#0D0D0D] hover:border-[#0D0D0D] transition-all"
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}

        {saved && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            Highlights saved successfully
          </span>
        )}
      </div>
    </div>
  );
}