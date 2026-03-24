// components/PropertyMediaSlider.tsx
"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, Images, PlayCircle, Maximize2, X,
  Trash2, Upload, Star, StarOff, AlertTriangle, Loader2,
  CheckCircle2, GripVertical, Plus
} from "lucide-react";
import {
  uploadPropertyImage,
  deletePropertyImage,
  updatePropertyImages,
} from "../admin/properties/[id]/imageAction"; // adjust path to match your project

type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

// ─────────────────────────── CONFIRM DIALOG ──────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
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
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {type === "success"
        ? <CheckCircle2 size={15} />
        : <AlertTriangle size={15} />
      }
      {message}
    </div>
  );
}

// ─────────────────────────── MAIN COMPONENT ──────────────────────────────────
export default function PropertyMediaSlider({
  images: initialImages,
  youtubeVideo,
  propertyId,
}: {
  images: string[];
  youtubeVideo?: string | null;
  propertyId: number;
}) {
  const [images, setImages]       = useState<string[]>(initialImages);
  const [current, setCurrent]     = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lightboxIdx, setLbIdx]   = useState(0);
  const [manageMode, setManage]   = useState(false);

  // Upload state
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget]   = useState<string | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // Thumbnail state
  const [thumbTarget, setThumbTarget]     = useState<string | null>(null);
  const [settingThumb, setSettingThumb]   = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Build media list
  const media: MediaItem[] = [
    ...images.map((img) => ({ type: "image" as const, src: img })),
    ...(youtubeVideo
      ? [{ type: "video" as const, src: youtubeVideo.replace("watch?v=", "embed/").split("&")[0] }]
      : []),
  ];

  const imageItems = media.filter((m) => m.type === "image") as { type: "image"; src: string }[];
  const item       = media[Math.min(current, media.length - 1)];

  const prev = useCallback(() => setCurrent((c) => (c - 1 + media.length) % media.length), [media.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % media.length), [media.length]);

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 10) {
      showToast("Maximum 10 images allowed", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd   = new FormData();
        fd.append("image", file);

        setUploadProgress(Math.round(((i) / files.length) * 90));
        const newUrl = await uploadPropertyImage(propertyId, fd, images);
        setImages((prev) => [...prev, newUrl]);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      showToast(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`, "success");
    } catch (err: any) {
      showToast(err.message ?? "Upload failed", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePropertyImage(propertyId, deleteTarget, images);
      const newImages = images.filter((img) => img !== deleteTarget);
      setImages(newImages);
      // Adjust current index if needed
      if (current >= newImages.length) setCurrent(Math.max(0, newImages.length - 1));
      showToast("Image deleted", "success");
    } catch (err: any) {
      showToast(err.message ?? "Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── SET THUMBNAIL ─────────────────────────────────────────────────────────
  // Thumbnail = first image in the array
  async function confirmSetThumbnail() {
    if (!thumbTarget) return;
    setSettingThumb(true);
    try {
      const newImages = [thumbTarget, ...images.filter((img) => img !== thumbTarget)];
      await updatePropertyImages(propertyId, newImages);
      setImages(newImages);
      setCurrent(0);
      showToast("Thumbnail updated", "success");
    } catch (err: any) {
      showToast(err.message ?? "Failed to update thumbnail", "error");
    } finally {
      setSettingThumb(false);
      setThumbTarget(null);
    }
  }

  // ── NO MEDIA ──────────────────────────────────────────────────────────────
  if (media.length === 0) {
    return (
      <div className="space-y-0">
        <div className="h-64 flex flex-col items-center justify-center bg-[#F7F7F7] text-[#B0B0B0] gap-3">
          <Images size={32} className="opacity-30" />
          <p className="text-sm">No media yet</p>
          <label className="flex items-center gap-2 px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#2a2a2a] transition-colors">
            <Upload size={13} />
            Upload Images
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    );
  }

  return (
    <>
      {/* ── MANAGE MODE TOGGLE ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#EDEDED]">
        <div className="flex items-center gap-2">
          <Images size={14} className="text-[#B0B0B0]" />
          <span className="text-xs font-medium text-[#B0B0B0]">
            {images.length} photo{images.length !== 1 ? "s" : ""}
            {youtubeVideo ? " · 1 video" : ""}
          </span>
        </div>
        <button
          onClick={() => setManage((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            manageMode
              ? "bg-[#0D0D0D] text-white"
              : "bg-[#F7F7F7] text-[#3A3A3A] hover:bg-[#EDEDED] border border-[#EDEDED]"
          }`}
        >
          {manageMode ? <X size={12} /> : <GripVertical size={12} />}
          {manageMode ? "Done" : "Manage"}
        </button>
      </div>

      {/* ── MAIN VIEWER ─────────────────────────────────────────────────── */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {item?.type === "image" ? (
          <>
            <Image
              src={item.src}
              alt={`Property image ${current + 1}`}
              fill
              className="object-cover"
              priority
            />
            {/* Expand (only in view mode) */}
            {!manageMode && (
              <button
                onClick={() => { setLbIdx(current); setLightbox(true); }}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <Maximize2 size={14} />
              </button>
            )}

            {/* Manage overlay on current image */}
            {manageMode && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40">
                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(item.src)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg"
                >
                  <Trash2 size={13} />
                  Delete
                </button>

                {/* Set as thumbnail */}
                {images[0] !== item.src && (
                  <button
                    onClick={() => setThumbTarget(item.src)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg"
                  >
                    <Star size={13} />
                    Set Thumbnail
                  </button>
                )}

                {images[0] === item.src && (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/80 text-white rounded-xl text-xs font-semibold">
                    <Star size={13} fill="white" />
                    Thumbnail
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <iframe
            src={item?.src}
            className="w-full h-full"
            allowFullScreen
            title="Property video"
          />
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Images size={11} />
          {current + 1} / {media.length}
        </div>

        {/* Thumbnail star indicator */}
        {item?.type === "image" && images[0] === item.src && (
          <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Star size={10} fill="white" />
            Thumbnail
          </div>
        )}
      </div>

      {/* ── UPLOAD PROGRESS BAR ─────────────────────────────────────────── */}
      {uploading && (
        <div className="bg-[#F7F7F7] px-4 py-3 border-b border-[#EDEDED]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#3A3A3A] flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Uploading images...
            </span>
            <span className="text-xs font-bold text-[#0D0D0D]">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDEDED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D] rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── THUMBNAIL STRIP ──────────────────────────────────────────────── */}
      <div className="bg-[#F7F7F7] border-b border-[#EDEDED]">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all group ${
                i === current
                  ? "border-[#0D0D0D] shadow-md scale-105"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              {m.type === "image" ? (
                <Image src={m.src} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0D0D0D] flex items-center justify-center">
                  <PlayCircle size={16} className="text-white" />
                </div>
              )}

              {/* Thumbnail star badge */}
              {m.type === "image" && images[0] === m.src && (
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Star size={8} fill="white" className="text-white" />
                </div>
              )}
            </button>
          ))}

          {/* Upload button in strip */}
          {manageMode && (
            <label className="relative flex-shrink-0 w-16 h-12 rounded-lg border-2 border-dashed border-[#B0B0B0] hover:border-[#0D0D0D] flex items-center justify-center cursor-pointer transition-colors bg-white">
              {uploading
                ? <Loader2 size={16} className="animate-spin text-[#B0B0B0]" />
                : <Plus size={16} className="text-[#B0B0B0]" />
              }
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* ── MANAGE TOOLBAR ───────────────────────────────────────────────── */}
      {manageMode && (
        <div className="bg-white border-b border-[#EDEDED] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#B0B0B0]">
              Click an image above, then use the overlay buttons to delete or set as thumbnail.
              <span className="text-amber-600 font-medium"> ★ = current thumbnail</span>
            </p>
            <label className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex-shrink-0 ${
              uploading
                ? "bg-[#EDEDED] text-[#B0B0B0] cursor-not-allowed"
                : "bg-[#0D0D0D] text-white hover:bg-[#2a2a2a]"
            }`}>
              {uploading
                ? <Loader2 size={13} className="animate-spin" />
                : <Upload size={13} />
              }
              {uploading ? "Uploading..." : "Upload New"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      )}

      {/* ── QUICK JUMP (video/photos) ────────────────────────────────────── */}
      {youtubeVideo && images.length > 0 && (
        <div className="flex gap-2 px-3 pb-3 pt-2 bg-[#F7F7F7]">
          <button
            onClick={() => setCurrent(0)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              media[current]?.type === "image"
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-white text-[#3A3A3A] border-[#EDEDED] hover:border-[#0D0D0D]"
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setCurrent(media.length - 1)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              media[current]?.type === "video"
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-white text-[#3A3A3A] border-[#EDEDED] hover:border-[#0D0D0D]"
            }`}
          >
            Video
          </button>
        </div>
      )}

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {lightboxIdx + 1} / {imageItems.length}
          </div>
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLbIdx((i) => (i - 1 + imageItems.length) % imageItems.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div
            className="relative w-full max-w-4xl mx-16"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={imageItems[lightboxIdx].src} alt="" fill className="object-contain" />
          </div>
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLbIdx((i) => (i + 1) % imageItems.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
          {imageItems.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {imageItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLbIdx(i); }}
                  className={`rounded-full transition-all ${i === lightboxIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DELETE CONFIRM ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this image?"
        description="This will permanently remove the image from storage and cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        confirmClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── THUMBNAIL CONFIRM ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!thumbTarget}
        title="Set as thumbnail?"
        description="This image will appear first in the slider and be used as the property's cover photo across the app."
        confirmLabel={settingThumb ? "Setting..." : "Yes, Set Thumbnail"}
        confirmClass="bg-amber-500 hover:bg-amber-600"
        onConfirm={confirmSetThumbnail}
        onCancel={() => setThumbTarget(null)}
      />

      {/* ── TOAST ───────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}