"use client";

import { useState } from "react";
import { PropertyStatus } from "@/lib/types";
import { updatePropertyStatus } from "./action";
import {
  Clock, CheckCircle2, XCircle, MessageSquare,
  ShieldCheck, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";


const STATUS_OPTIONS: {
  value: PropertyStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "W",
    label: "Pending Review",
    description: "Property is awaiting admin review",
    icon: <Clock size={15} />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    value: "Y",
    label: "Approve",
    description: "List this property publicly on the app",
    icon: <CheckCircle2 size={15} />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    value: "N",
    label: "Reject",
    description: "Decline with a mandatory reason",
    icon: <XCircle size={15} />,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
];

export default function StatusUpdateForm({
  propertyId,
  currentStatus,
}: {
  propertyId: number;
  currentStatus: PropertyStatus;
}) {
  const [status, setStatus]   = useState<PropertyStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const isChanged  = status !== currentStatus;
  const canSubmit  = comment.trim().length >= 3 && !loading;
  const router = useRouter();      
  async function submit() {
    setLoading(true);
    await updatePropertyStatus(propertyId, status, comment);
    setLoading(false);
    setDone(true);
    setTimeout(() => { setDone(false); router.refresh(); }, 1500);
  }

  const selected = STATUS_OPTIONS.find((o) => o.value === status)!;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center">
          <ShieldCheck size={13} className="text-white" />
        </div>
        <h3 className="font-semibold text-[#0D0D0D] text-sm">Update Status</h3>
      </div>

      {/* Current status display */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${selected.bg} ${selected.border} ${selected.color}`}>
        {selected.icon}
        <span>Currently: <strong>{selected.label}</strong></span>
      </div>

      {/* Status options */}
      <div className="space-y-2">
        {STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              status === opt.value
                ? `${opt.bg} ${opt.border}`
                : "bg-[#F7F7F7] border-[#EDEDED] hover:border-[#B0B0B0]"
            }`}
          >
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => { setStatus(opt.value); setDone(false); }}
              className="mt-0.5 accent-[#0D0D0D]"
            />
            <div>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                status === opt.value ? opt.color : "text-[#0D0D0D]"
              }`}>
                {opt.icon}
                {opt.label}
              </div>
              <p className="text-[11px] text-[#B0B0B0] mt-0.5">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Comment box */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#B0B0B0] uppercase tracking-wide">
          <MessageSquare size={11} />
          Comment <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border border-[#EDEDED] rounded-xl p-3 text-sm text-[#0D0D0D] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 focus:border-[#0D0D0D] transition-all placeholder:text-[#B0B0B0]"
          rows={3}
          placeholder={
            status === "Y"
              ? "e.g. Verified and approved. Property listed publicly."
              : status === "N"
              ? "e.g. Images unclear. Please resubmit with better photos."
              : "Add a comment about this status change..."
          }
          value={comment}
          onChange={(e) => { setComment(e.target.value); setDone(false); }}
        />
        {comment.length > 0 && comment.trim().length < 3 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <AlertTriangle size={11} />
            Comment must be at least 3 characters
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        disabled={!canSubmit}
        onClick={submit}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          done
            ? "bg-green-600 text-white"
            : isChanged
            ? "bg-[#0D0D0D] text-white hover:bg-[#2a2a2a]"
            : "bg-[#0D0D0D] text-white hover:bg-[#2a2a2a]"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {done ? (
          <><CheckCircle2 size={15} /> Updated!</>
        ) : loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
        ) : (
          <><ShieldCheck size={15} /> Submit Update</>
        )}
      </button>
    </div>
  );
}