"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  Upload, Trash2, Users, X, CheckCircle2, AlertTriangle,
  Loader2, Phone, User, Clock, ChevronDown, ChevronUp,
  Images, Plus
} from "lucide-react";

// ─────────────────────────── TYPES ───────────────────────────────────────────
type InterestRow = {
  id: number;
  created_at: string;
  image_url: string;
  user_id: string;
  users: { name: string | null; phone: string | null } | null;
};

type Props = {
  imageUrls:    string[];
  interestMap:  Record<string, InterestRow[]>;
  uploadAction: (fd: FormData) => Promise<string>;
  deleteAction: (url: string) => Promise<void>;
};

// ─────────────────────────── HELPERS ─────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─────────────────────────── CONFIRM DIALOG ──────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel, confirmClass,
  onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string;
  confirmLabel: string; confirmClass?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#0D0D0D] text-sm">{title}</h3>
            <p className="text-xs text-[#B0B0B0] mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-[#EDEDED] text-sm font-medium text-[#3A3A3A] hover:bg-[#F7F7F7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${confirmClass ?? "bg-red-500 hover:bg-red-600"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── TOAST ───────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
      {msg}
    </div>
  );
}

// ─────────────────────────── MAIN COMPONENT ──────────────────────────────────
export default function InvestmentImageManager({
  imageUrls: initialUrls,
  interestMap,
  uploadAction,
  deleteAction,
}: Props) {
  const [urls, setUrls]           = useState<string[]>(initialUrls);
  const [deleteTarget, setDel]    = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // Which cards have their interest panel expanded
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setUploadPct(0);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("image", files[i]);
      try {
        setUploadPct(Math.round((i / files.length) * 90));
        const url = await uploadAction(fd);
        newUrls.push(url);
        setUploadPct(Math.round(((i + 1) / files.length) * 100));
      } catch (err: any) {
        showToast(err.message ?? "Upload failed", "error");
      }
    }

    setUrls((prev) => [...newUrls, ...prev]);
    setUploading(false);
    setUploadPct(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (newUrls.length) showToast(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`, "success");
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAction(deleteTarget);
      setUrls((prev) => prev.filter((u) => u !== deleteTarget));
      showToast("Image deleted", "success");
    } catch (err: any) {
      showToast(err.message ?? "Delete failed", "error");
    } finally {
      setDeleting(false);
      setDel(null);
    }
  }

  function toggleExpand(url: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  // ── EMPTY ─────────────────────────────────────────────────────────────────
  if (urls.length === 0 && !uploading) {
    return (
      <div className="space-y-6">
        <UploadBar uploading={uploading} pct={uploadPct}
          onFileChange={handleFiles} fileRef={fileInputRef} />
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-[#EDEDED]">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] flex items-center justify-center">
            <Images size={24} className="text-[#B0B0B0]" />
          </div>
          <p className="font-semibold text-[#0D0D0D]">No images yet</p>
          <p className="text-sm text-[#B0B0B0]">Upload images to the investment folder to get started.</p>
        </div>
      </div>
    );
  }

  // ── MAIN ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Upload bar */}
      <UploadBar uploading={uploading} pct={uploadPct}
        onFileChange={handleFiles} fileRef={fileInputRef} />

      {/* Image cards */}
      {urls.map((url, index) => {
        const interested = interestMap[url] ?? [];
        const isExpanded = expanded.has(url);

        return (
          <div
            key={url}
            className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden"
          >
            {/* ── IMAGE ──────────────────────────────────────────────── */}
            <div className="relative" style={{ aspectRatio: "16/9" }}>
              <Image
                src={url}
                alt={`Investment photo ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Top-left: index badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Images size={11} />
                {index + 1} / {urls.length}
              </div>

              {/* Top-right: delete button */}
              <button
                onClick={() => setDel(url)}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 hover:bg-red-600 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                title="Delete image"
              >
                <Trash2 size={15} />
              </button>

              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Bottom-left: interest count badge */}
              <div className="absolute bottom-3 left-3">
                {interested.length > 0 ? (
                  <div className="flex items-center gap-1.5 bg-[#0D0D0D] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                    <Users size={12} />
                    {interested.length} interested
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-black/50 text-white/70 text-xs px-3 py-1.5 rounded-full">
                    <Users size={12} />
                    No interest yet
                  </div>
                )}
              </div>
            </div>

            {/* ── INTEREST PANEL ─────────────────────────────────────── */}
            {interested.length > 0 && (
              <>
                {/* Toggle button */}
                <button
                  onClick={() => toggleExpand(url)}
                  className="w-full flex items-center justify-between px-5 py-3 border-t border-[#EDEDED] hover:bg-[#F7F7F7] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#0D0D0D] flex items-center justify-center">
                      <Users size={11} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#0D0D0D]">
                      {interested.length} {interested.length === 1 ? "person" : "people"} interested
                    </span>
                  </div>
                  {isExpanded
                    ? <ChevronUp size={15} className="text-[#B0B0B0]" />
                    : <ChevronDown size={15} className="text-[#B0B0B0]" />
                  }
                </button>

                {/* Expanded list */}
                {isExpanded && (
                  <div className="border-t border-[#F7F7F7] divide-y divide-[#F7F7F7]">
                    {interested.map((row) => (
                      <div key={row.id} className="flex items-center gap-3 px-5 py-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {row.users?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                              {row.users?.name ?? "Unknown"}
                            </p>
                          </div>
                          {row.users?.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone size={10} className="text-[#B0B0B0]" />
                              <span className="text-xs text-[#B0B0B0]">
                                {row.users.phone}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1 text-[10px] text-[#B0B0B0] flex-shrink-0">
                          <Clock size={10} />
                          {timeAgo(row.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* No interest footer */}
            {interested.length === 0 && (
              <div className="px-5 py-3 border-t border-[#EDEDED]">
                <p className="text-xs text-[#B0B0B0]">
                  No one has expressed interest in this image yet.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this image?"
        description="This will permanently remove the image from storage. Users who expressed interest will still have their records, but the image will be gone."
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setDel(null)}
      />

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ─────────────────────────── UPLOAD BAR ──────────────────────────────────────
function UploadBar({
  uploading, pct, onFileChange, fileRef,
}: {
  uploading: boolean;
  pct: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center">
            <Upload size={13} className="text-white" />
          </div>
          <h3 className="font-semibold text-[#0D0D0D] text-sm">Upload Images</h3>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
          uploading
            ? "bg-[#EDEDED] text-[#B0B0B0] cursor-not-allowed"
            : "bg-[#0D0D0D] text-white hover:bg-[#2a2a2a]"
        }`}>
          {uploading
            ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
            : <><Plus size={14} /> Add Photos</>
          }
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#3A3A3A] flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" />
              Uploading to investment folder...
            </span>
            <span className="text-xs font-bold text-[#0D0D0D]">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDEDED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {!uploading && (
        <p className="text-xs text-[#B0B0B0]">
          Images are stored in the <code className="bg-[#F7F7F7] px-1.5 py-0.5 rounded text-[10px] border border-[#EDEDED]">images/investment</code> bucket and shown to users in the app.
        </p>
      )}
    </div>
  );
}