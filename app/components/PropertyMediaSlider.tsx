"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Images, PlayCircle, Maximize2, X } from "lucide-react";

type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

export default function PropertyMediaCarousel({
  images,
  youtubeVideo,
}: {
  images: string[];
  youtubeVideo?: string | null;
}) {
  const media: MediaItem[] = [
    ...images.map((img) => ({ type: "image" as const, src: img })),
    ...(youtubeVideo
      ? [{
          type: "video" as const,
          src: youtubeVideo.replace("watch?v=", "embed/").split("&")[0],
        }]
      : []),
  ];

  const [current, setCurrent]     = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lightboxIdx, setLbIdx]   = useState(0);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + media.length) % media.length), [media.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % media.length), [media.length]);

  const openLightbox = (idx: number) => {
    if (media[idx].type === "image") { setLbIdx(idx); setLightbox(true); }
  };

  if (media.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center bg-[#F7F7F7] text-[#B0B0B0] gap-2">
        <Images size={32} className="opacity-40" />
        <p className="text-sm">No media available</p>
      </div>
    );
  }

  const item = media[current];
  const imageItems = media.filter((m) => m.type === "image");

  return (
    <>
      {/* ── MAIN VIEWER ─────────────────────────────────────────────── */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {item.type === "image" ? (
          <>
            <Image
              src={item.src}
              alt={`Property image ${current + 1}`}
              fill
              className="object-cover"
              priority
            />
            {/* Expand button */}
            <button
              onClick={() => openLightbox(current)}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <Maximize2 size={14} />
            </button>
          </>
        ) : (
          <iframe src={item.src} className="w-full h-full" allowFullScreen title="Property video" />
        )}

        {/* Gradient overlay */}
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

        {/* Counter badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Images size={11} />
          {current + 1} / {media.length}
        </div>

        {/* Video badge */}
        {item.type === "video" && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <PlayCircle size={11} />
            Video Tour
          </div>
        )}
      </div>

      {/* ── THUMBNAIL STRIP ──────────────────────────────────────────── */}
      {media.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-[#F7F7F7] scrollbar-none">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-[#0D0D0D] shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              {m.type === "image" ? (
                <Image src={m.src} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0D0D0D] flex items-center justify-center">
                  <PlayCircle size={16} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── QUICK JUMP ───────────────────────────────────────────────── */}
      {youtubeVideo && images.length > 0 && (
        <div className="flex gap-2 px-3 pb-3 bg-[#F7F7F7]">
          <button
            onClick={() => setCurrent(0)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              media[current].type === "image"
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-white text-[#3A3A3A] border-[#EDEDED] hover:border-[#0D0D0D]"
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setCurrent(media.length - 1)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              media[current].type === "video"
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-white text-[#3A3A3A] border-[#EDEDED] hover:border-[#0D0D0D]"
            }`}
          >
            Video
          </button>
        </div>
      )}

      {/* ── LIGHTBOX ─────────────────────────────────────────────────── */}
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

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {lightboxIdx + 1} / {imageItems.length}
          </div>

          {/* Prev */}
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLbIdx((i) => (i - 1 + imageItems.length) % imageItems.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-4xl mx-16" style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageItems[lightboxIdx].src}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          {/* Next */}
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLbIdx((i) => (i + 1) % imageItems.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Dot indicators */}
          {imageItems.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {imageItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLbIdx(i); }}
                  className={`rounded-full transition-all ${
                    i === lightboxIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}