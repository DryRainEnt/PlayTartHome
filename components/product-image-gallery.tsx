"use client"

import { useState } from "react"

interface ProductImageGalleryProps {
  thumbnailUrl: string | null
  previewImages: string[] | null
  title: string
}

export function ProductImageGallery({
  thumbnailUrl,
  previewImages,
  title,
}: ProductImageGalleryProps) {
  const allImages = [
    ...(thumbnailUrl ? [thumbnailUrl] : []),
    ...(previewImages || []),
  ]

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = allImages[selectedIndex] || null

  if (allImages.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          제품 이미지
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={selectedImage!}
          alt={title}
          className="h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.slice(0, 8).map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`aspect-square overflow-hidden rounded-lg bg-muted transition-all ${
                idx === selectedIndex
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} preview ${idx + 1}`}
                className="h-full w-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
