"use client";

import { useState } from "react";

export default function ProjectGallery({ images }: { images: any[] }) {
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const open = (i: number) => setViewIndex(i);
  const close = () => setViewIndex(null);

  const next = () =>
    setViewIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    );

  const prev = () =>
    setViewIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    );

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative group cursor-pointer overflow-hidden"
            onClick={() => open(i)}
          >
            <img
              src={img.image_url}
              alt={img.caption || ""}
              className="
                w-full h-full object-cover 
                transition-transform duration-300 
                group-hover:scale-105
              "
            />

            {/* Hover overlay */}
            <div className="
              absolute inset-0 bg-black/0 
              group-hover:bg-black/20 
              transition 
            " />
          </div>
        ))}
      </div>

      {/* MODAL VIEWER */}
      {viewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center"
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            className="absolute left-6 text-white/70 hover:text-white text-4xl select-none"
          >
            ‹
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-6 text-white/70 hover:text-white text-4xl select-none"
          >
            ›
          </button>

          {/* Image */}
          <img
            src={images[viewIndex].image_url}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          />

          {/* Caption */}
          {images[viewIndex].caption && (
            <div className="absolute bottom-6 text-center w-full text-white/80 text-sm">
              {images[viewIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
