"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    ...images.map((img) => ({ type: "image", src: img })),
    ...(youtubeVideo
      ? [
          {
            type: "video",
            src: youtubeVideo
              .replace("watch?v=", "embed/")
              .split("&")[0],
          },
        ]
      : []),
  ];

  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  // 🚫 No media
  if (media.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border rounded bg-muted text-muted-foreground">
        No media available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ===== CAROUSEL ===== */}
      <Carousel
        className="w-full"
        setApi={(a) => {
          if (!a) return;
          setApi(a);
          setCurrent(a.selectedScrollSnap());
          a.on("select", () =>
            setCurrent(a.selectedScrollSnap())
          );
        }}
      >
        <CarouselContent>
          {media.map((item, idx) => (
            <CarouselItem key={idx}>
              <div className="relative h-96 rounded overflow-hidden bg-black">
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt="Property media"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <iframe
                    src={item.src}
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrow buttons
        {media.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )} */}
      </Carousel>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Prev / Next */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => api?.scrollPrev()}
            disabled={!api || current === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => api?.scrollNext()}
            disabled={!api || current === media.length - 1}
          >
            Next
          </Button>
        </div>

        {/* Quick jump buttons */}
        <div className="flex gap-2">
          {images.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => api?.scrollTo(0)}
            >
              Images
            </Button>
          )}
          {youtubeVideo && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => api?.scrollTo(media.length - 1)}
            >
              Video
            </Button>
          )}
        </div>
      </div>

      {/* ===== DOT INDICATORS ===== */}
      {media.length > 1 && (
        <div className="flex justify-center gap-2">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={`h-2 w-2 rounded-full transition
                ${
                  idx === current
                    ? "bg-black"
                    : "bg-gray-300"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
