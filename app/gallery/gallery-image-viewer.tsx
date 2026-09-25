"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryCollection, GalleryImageRecord } from "./data";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An image could not be loaded for download."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("The watermarked image could not be created."));
      }
    }, "image/jpeg", 0.92);
  });
}

type GalleryImageViewerProps = {
  slug?: string;
  src?: string;
  alt?: string;
  initiallyOpen?: boolean;
  initialImageSlug?: string;
  images?: GalleryImageRecord[];
  collections?: GalleryCollection[];
  className?: string;
  thumbnailClassName?: string;
  sizes?: string;
};

export default function GalleryImageViewer({
  slug,
  src = "",
  alt = "",
  initiallyOpen = false,
  initialImageSlug,
  images,
  collections,
  className = "gallery-image-frame gallery-viewer-trigger",
  thumbnailClassName = "gallery-image",
  sizes = "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw",
}: GalleryImageViewerProps) {
  const isGallery = Boolean(images && collections);
  const requestedImage = images?.find((image) => image.slug === initialImageSlug) ?? null;
  const [activeImage, setActiveImage] = useState<GalleryImageRecord | null>(requestedImage);
  const [isOpen, setIsOpen] = useState(Boolean(requestedImage) || initiallyOpen);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentImage = activeImage;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isGallery || !images) return;

    const syncViewerWithLocation = () => {
      const pathSlug = window.location.pathname.replace(/\/+$/, "").split("/").pop();
      const nextImage = images.find((image) => image.slug === pathSlug);
      setActiveImage(nextImage ?? null);
      setIsOpen(Boolean(nextImage));
    };

    window.addEventListener("popstate", syncViewerWithLocation);
    return () => window.removeEventListener("popstate", syncViewerWithLocation);
  }, [images, isGallery]);

  function selectImage(image: GalleryImageRecord | null, updateUrl: boolean) {
    if (image && updateUrl && isGallery) {
      const imagePath = `/gallery/${image.slug}`;
      if (window.location.pathname.replace(/\/+$/, "") !== imagePath) {
        window.history.pushState(null, "", imagePath);
      }
    }
    setActiveImage(image);
    setIsOpen(true);
  }

  function openViewer() {
    const image = images?.find((item) => item.slug === slug) ?? null;
    selectImage(image, Boolean(image));
  }

  function closeViewer() {
    const currentPath = window.location.pathname.replace(/\/+$/, "");
    if (isGallery && currentImage && currentPath === `/gallery/${currentImage.slug}`) {
      window.history.replaceState(null, "", "/gallery/");
    }
    setIsOpen(false);
  }

  function navigateImage(direction: -1 | 1) {
    if (!images || !currentImage || images.length < 2) return;
    const currentIndex = images.findIndex((image) => image.slug === currentImage.slug);
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    const nextImage = images[nextIndex];
    if (!nextImage) return;

    window.history.pushState(null, "", `/gallery/${nextImage.slug}`);
    setActiveImage(nextImage);
  }

  async function shareImage() {
    if (!isGallery || !currentImage) return;
    const url = new URL(`/gallery/${currentImage.slug}`, window.location.origin).toString();
    setShareStatus("");

    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: currentImage.title, url });
          setShareStatus("Link shared.");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("textarea");
        input.value = url;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (!copied) throw new Error("The link could not be copied.");
      }
      setShareStatus("Gallery link copied.");
    } catch {
      setShareStatus("The link could not be shared. Please try again.");
    }
  }

  async function downloadWatermarkedImage() {
    let canvas: HTMLCanvasElement | null = null;
    let objectUrl: string | null = null;
    setIsDownloading(true);
    setDownloadError("");

    try {
      const imageSrc = currentImage?.src ?? src;
      const [sourceImage, logo] = await Promise.all([
        loadImage(imageSrc),
        loadImage("/nipsa-logo.png"),
      ]);

      if (!sourceImage.naturalWidth || !sourceImage.naturalHeight || !logo.naturalWidth) {
        throw new Error("The source image or NIPSA logo has invalid dimensions.");
      }

      canvas = document.createElement("canvas");
      canvas.width = sourceImage.naturalWidth;
      canvas.height = sourceImage.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Your browser could not prepare the image for download.");
      }

      context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

      const watermarkWidth = canvas.width * 0.15;
      const watermarkHeight = watermarkWidth * (logo.naturalHeight / logo.naturalWidth);
      const marginX = canvas.width * 0.03;
      const marginY = canvas.height * 0.03;
      const attribution = "Nigeria Pharmacology Students' Association | NIPSA UNILESA CHAPTER";
      const fontSize = Math.max(10, canvas.width * 0.012);
      const textGap = Math.max(4, canvas.height * 0.006);
      const textBaseline = canvas.height - marginY;
      const logoY = textBaseline - fontSize * 1.35 - textGap - watermarkHeight;

      context.globalAlpha = 0.3;
      context.drawImage(
        logo,
        canvas.width - watermarkWidth - marginX,
        logoY,
        watermarkWidth,
        watermarkHeight,
      );
      context.globalAlpha = 0.82;
      context.font = `600 ${fontSize}px Arial, sans-serif`;
      context.textAlign = "right";
      context.textBaseline = "bottom";
      context.shadowColor = "rgba(0, 0, 0, 0.75)";
      context.shadowBlur = Math.max(1, fontSize * 0.18);
      context.fillStyle = "#fff";
      context.fillText(attribution, canvas.width - marginX, textBaseline);
      context.globalAlpha = 1;
      context.shadowBlur = 0;

      const blob = await canvasToBlob(canvas);
      const downloadUrl = URL.createObjectURL(blob);
      objectUrl = downloadUrl;
      const link = document.createElement("a");
      const imageName = decodeURIComponent(new URL(imageSrc, window.location.href).pathname.split("/").pop() ?? "gallery-image");
      const baseName = imageName.replace(/\.[^.]+$/, "");
      link.href = downloadUrl;
      link.download = `${baseName}-nipsa.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      objectUrl = null;
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "The image could not be prepared for download. Please try again.",
      );
    } finally {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setIsDownloading(false);
    }
  }

  const thumbnail = (
    <button
      type="button"
      className={className}
      aria-label={`View full-screen image: ${alt}`}
      onClick={openViewer}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className={thumbnailClassName} />
    </button>
  );

  return (
    <>
      {isGallery && images && collections ? (
        <div className="gallery-collections">
          {collections.map((collection, collectionIndex) => (
            <section
              className="gallery-collection"
              key={collection.title}
              aria-labelledby={`gallery-collection-${collectionIndex}`}
            >
              <div className="gallery-collection-heading">
                <p className="eyebrow">{String(collectionIndex + 1).padStart(2, "0")} / PRACTICAL SESSION</p>
                <h2 id={`gallery-collection-${collectionIndex}`}>{collection.title}</h2>
                <p>{collection.description}</p>
              </div>
              <div className="gallery-grid">
                {collection.images.map((image) => {
                  const record = images.find((item) => item.slug === image.slug);
                  return (
                    <figure className="gallery-item" key={image.src}>
                      <button
                        type="button"
                        className="gallery-image-frame gallery-viewer-trigger"
                        aria-label={`View full-screen image: ${image.alt}`}
                        onClick={() => selectImage(record ?? null, true)}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes={sizes}
                          className="gallery-image"
                        />
                      </button>
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : thumbnail}
      <dialog
        ref={dialogRef}
        className="gallery-lightbox"
        aria-label={`Full-screen image: ${currentImage?.alt ?? alt}`}
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeViewer();
          }
        }}
        onClose={closeViewer}
      >
        <button
          type="button"
          className="gallery-lightbox-close"
          aria-label="Close image viewer"
          onClick={closeViewer}
        >
          <span aria-hidden="true">×</span>
        </button>
        {isGallery && images && currentImage ? (
          <div className="gallery-lightbox-navigation">
            <button
              type="button"
              className="gallery-lightbox-control"
              aria-label="Previous image"
              onClick={() => navigateImage(-1)}
            >
              <span aria-hidden="true">←</span>
              Previous
            </button>
            <button
              type="button"
              className="gallery-lightbox-control"
              aria-label="Next image"
              onClick={() => navigateImage(1)}
            >
              Next
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
        <div className="gallery-lightbox-actions">
          {downloadError ? <p className="gallery-download-error" role="alert">{downloadError}</p> : null}
          {isGallery && currentImage ? (
            <>
              <button
                type="button"
                className="gallery-lightbox-control"
                aria-label="Share image link"
                onClick={shareImage}
              >
                Share
              </button>
              <span className="gallery-share-status" role="status" aria-live="polite">{shareStatus}</span>
            </>
          ) : null}
          <button
            type="button"
            className="gallery-lightbox-download"
            aria-label="Download image"
            onClick={downloadWatermarkedImage}
            disabled={isDownloading}
          >
            {isDownloading ? "Preparing download…" : "Download"}
          </button>
        </div>
        {(currentImage?.src || src) ? (
          <Image
            src={currentImage?.src ?? src}
            alt={currentImage?.alt ?? alt}
            fill
            sizes="100vw"
            className="gallery-lightbox-image"
          />
        ) : null}
      </dialog>
    </>
  );
}
