"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "Rooms" | "Kitchen & Washrooms" | "Exterior";

type GalleryImage = {
  id: number;
  src: string;
  category: Category;
  aspect: string;
};

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: "/images/rooms/exterior-1.png", category: "Exterior", aspect: "aspect-[4/5]" },
  { id: 2, src: "/images/rooms/master-bedroom-1.jpg", category: "Rooms", aspect: "aspect-square" },
  { id: 3, src: "/images/rooms/twin-room-1.jpg", category: "Rooms", aspect: "aspect-[3/4]" },
  { id: 4, src: "/images/rooms/kitchen-1.jpg", category: "Kitchen & Washrooms", aspect: "aspect-square" },
  { id: 5, src: "/images/rooms/bathroom-1.jpg", category: "Kitchen & Washrooms", aspect: "aspect-[4/5]" },
  { id: 6, src: "/images/rooms/master-bedroom-2.jpg", category: "Rooms", aspect: "aspect-square" },
  { id: 7, src: "/images/rooms/twin-room-2.png", category: "Rooms", aspect: "aspect-[3/4]" },
  { id: 8, src: "/images/rooms/master-bedroom-3.png", category: "Rooms", aspect: "aspect-[4/5]" },
  { id: 9, src: "/images/rooms/bathroom-2.jpg", category: "Kitchen & Washrooms", aspect: "aspect-square" },
];

const FILTERS = ["All", "Rooms", "Kitchen & Washrooms", "Exterior"] as const;
type Filter = (typeof FILTERS)[number];

export default function GalleryPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  const filteredImages =
    filter === "All"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((image) => image.category === filter);

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Gallery
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Gallery</span>
          </p>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95",
                filter === f
                  ? "bg-gold text-gold-foreground"
                  : "border border-border text-primary hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* MASONRY IMAGE GRID */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="columns-2 gap-4 md:columns-3">
          {filteredImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={cn(
                "group relative mb-4 block w-full cursor-zoom-in overflow-hidden rounded-xl break-inside-avoid",
                image.aspect
              )}
            >
              <Image
                src={image.src}
                alt={`Dove Inn Hotel — ${image.category}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/30" />
            </button>
          ))}
        </div>
      </section>

      {/* LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
            className="absolute top-6 right-6 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={`Dove Inn Hotel — ${selectedImage.category}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
