"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import {
  Upload, Trash2, X, AlertTriangle, CheckCircle2,
  Loader2, Images, Plus, ZoomIn, ChevronLeft, ChevronRight,
} from "lucide-react";
import { uploadInvestmentImage, deleteInvestmentImage } from "./action";

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2
        px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDialog({
  open, onConfirm, onCancel, loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#0D0D0D] text-sm">Delete this image?</h3>
            <p className="text-xs text-[#B0B0B0] mt-1 leading-relaxed">
              This permanently removes the image from Supabase storage. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl border border-[#EDEDED] text-sm font-medium text-[#3A3A3A] hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({
  images, index, onClose, onNav,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {index + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav((index - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full max-w-5xl mx-20"
        style={{ aspectRatio: "16/9" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={images[index]} alt="" fill className="object-contain" />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav((index + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Dot strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onNav(i); }}
              className={`rounded-full transition-all ${
                i === index ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAG-OVER UPLOAD ZONE
// ─────────────────────────────────────────────────────────────────────────────
function UploadZone({ onFiles, disabled }: { onFiles: (files: FileList) => void; disabled: boolean }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none
        ${dragging
          ? "border-[#0D0D0D] bg-[#0D0D0D]/5 scale-[1.01]"
          : "border-[#EDEDED] bg-white hover:border-[#B0B0B0] hover:bg-[#F7F7F7]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] flex items-center justify-center">
        <Upload size={20} className="text-[#B0B0B0]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#0D0D0D]">
          {dragging ? "Drop to upload" : "Upload images"}
        </p>
        <p className="text-xs text-[#B0B0B0] mt-0.5">Drag & drop or click · JPG, PNG, WEBP</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function InvestmentImagesManager({
  initialImages,
}: {
  initialImages: string[];
}) {
  const [images, setImages]         = useState<string[]>(initialImages);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [deleteTarget, setDelete]   = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [lightboxIdx, setLightbox]  = useState<number | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── UPLOAD ──────────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList) => {
    const MAX = 20;
    if (images.length + files.length > MAX) {
      showToast(`Maximum ${MAX} images allowed`, "error");
      return;
    }

    setUploading(true);
    setProgress(0);
    const uploaded: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("image", files[i]);
        setProgress(Math.round((i / files.length) * 90));
        const url = await uploadInvestmentImage(fd);
        uploaded.push(url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setImages((prev) => [...uploaded, ...prev]);
      showToast(
        `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message ?? "Upload failed", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [images.length]);

  // ── DELETE ───────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvestmentImage(deleteTarget);
      setImages((prev) => prev.filter((u) => u !== deleteTarget));
      // Adjust lightbox if open
      if (lightboxIdx !== null) {
        const newLen = images.length - 1;
        if (newLen === 0) setLightbox(null);
        else setLightbox(Math.min(lightboxIdx, newLen - 1));
      }
      showToast("Image deleted", "success");
    } catch (err: any) {
      showToast(err.message ?? "Delete failed", "error");
    } finally {
      setDeleting(false);
      setDelete(null);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── UPLOAD PROGRESS ─────────────────────────────────────────────── */}
      {uploading && (
        <div className="mb-4 bg-white border border-[#EDEDED] rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#3A3A3A] flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-[#0D0D0D]" />
              Uploading to investment folder…
            </span>
            <span className="text-xs font-bold text-[#0D0D0D]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDEDED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── UPLOAD ZONE ─────────────────────────────────────────────────── */}
      <UploadZone onFiles={handleFiles} disabled={uploading} />

      {/* ── COUNT HEADER ────────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="mt-6 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#0D0D0D] flex items-center justify-center">
              <Images size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[#0D0D0D]">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-[#B0B0B0]">in investment folder</span>
          </div>
          <span className="text-xs text-[#B0B0B0]">
            Click image to preview · hover to delete
          </span>
        </div>
      )}

      {/* ── IMAGE GRID ──────────────────────────────────────────────────── */}
      {images.length === 0 && !uploading ? (
        <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F7F7] flex items-center justify-center mb-4">
            <Images size={28} className="text-[#B0B0B0]" />
          </div>
          <p className="text-sm font-semibold text-[#0D0D0D]">No images yet</p>
          <p className="text-xs text-[#B0B0B0] mt-1">
            Upload images using the zone above — they&apos;ll appear here instantly.
          </p>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square rounded-xl overflow-hidden bg-[#EDEDED] shadow-sm border border-[#EDEDED] hover:shadow-md hover:border-[#B0B0B0] transition-all"
            >
              <Image
                src={url}
                alt={`Investment image ${i + 1}`}
                fill
                className="object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Preview */}
                <button
                  onClick={() => setLightbox(i)}
                  title="Preview"
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0D0D0D] shadow transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                {/* Delete */}
                <button
                  onClick={() => setDelete(url)}
                  title="Delete"
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Index badge */}
              <div className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                {i + 1}
              </div>
            </div>
          ))}

          {/* Inline upload tile */}
          <label className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all
            ${uploading
              ? "border-[#EDEDED] bg-[#FAFAFA] opacity-50 cursor-not-allowed"
              : "border-[#EDEDED] bg-white hover:border-[#0D0D0D] hover:bg-[#F7F7F7]"
            }`}
          >
            {uploading
              ? <Loader2 size={18} className="animate-spin text-[#B0B0B0]" />
              : <Plus size={18} className="text-[#B0B0B0]" />
            }
            <span className="text-[10px] text-[#B0B0B0] font-medium">Add more</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </label>
        </div>
      )}

      {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          index={lightboxIdx}
          onClose={() => setLightbox(null)}
          onNav={setLightbox}
        />
      )}

      {/* ── DELETE CONFIRM ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDelete(null)}
        loading={deleting}
      />

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}