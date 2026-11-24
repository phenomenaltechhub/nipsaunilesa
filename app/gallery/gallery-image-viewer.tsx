"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from "react";
import type { GalleryCollection, GalleryImageRecord } from "./data";

function loadImage(src: string, label: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`The ${label} could not be loaded for download.`));
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
    }, "image/png");
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pointerStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const currentImage = activeImage;
  const currentCollection = collections?.find((collection) => collection.slug === currentImage?.collectionSlug);
  const collectionImageIndex = currentCollection?.images.findIndex((image) => image.slug === currentImage?.slug) ?? -1;

  function resetImageView() {
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
    touchStart.current = null;
    pointerStart.current = null;
  }

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
      resetImageView();
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
    resetImageView();
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
      window.history.replaceState(null, "", "/gallery");
    }
    resetImageView();
    setIsOpen(false);
  }

  function navigateImage(direction: -1 | 1) {
    if (!images || !currentImage || images.length < 2) return;
    const currentIndex = images.findIndex((image) => image.slug === currentImage.slug);
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    const nextImage = images[nextIndex];
    if (!nextImage) return;

    window.history.pushState(null, "", `/gallery/${nextImage.slug}`);
    resetImageView();
    setActiveImage(nextImage);
  }

  function toggleZoom() {
    setIsZoomed((current) => !current);
    setPan({ x: 0, y: 0 });
  }

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (isZoomed || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch || !isGallery || !currentImage || isZoomed) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      navigateImage(deltaX < 0 ? 1 : -1);
    }
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isZoomed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!isZoomed || !start || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setPan({ x: start.panX + event.clientX - start.x, y: start.panY + event.clientY - start.y });
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStart.current = null;
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
        loadImage(imageSrc, "original photo"),
        loadImage("/nipsa-logo.png", "official NIPSA emblem"),
      ]);

      if (!sourceImage.naturalWidth || !sourceImage.naturalHeight || !logo.naturalWidth || !logo.naturalHeight) {
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

      const logoAspect = logo.naturalWidth / logo.naturalHeight;
      const watermarkWidth = Math.min(canvas.width * 0.23, canvas.height * 0.18 * logoAspect);
      const watermarkHeight = watermarkWidth * (logo.naturalHeight / logo.naturalWidth);
      const padding = Math.max(8, canvas.width * 0.012);
      const marginX = canvas.width * 0.035;
      const marginY = canvas.height * 0.035;
      const plateWidth = watermarkWidth + padding * 2;
      const plateHeight = watermarkHeight + padding * 2;
      const plateX = canvas.width - plateWidth - marginX;
      const plateY = canvas.height - plateHeight - marginY;

      context.fillStyle = "rgba(255, 255, 255, 0.68)";
      context.fillRect(plateX, plateY, plateWidth, plateHeight);
      context.globalAlpha = 0.65;
      context.drawImage(logo, plateX + padding, plateY + padding, watermarkWidth, watermarkHeight);
      context.globalAlpha = 1;

      const blob = await canvasToBlob(canvas);
      const downloadUrl = URL.createObjectURL(blob);
      objectUrl = downloadUrl;
      const link = document.createElement("a");
      const imageName = decodeURIComponent(new URL(imageSrc, window.location.href).pathname.split("/").pop() ?? "gallery-image");
      const baseName = imageName.replace(/\.[^.]+$/, "");
      link.href = downloadUrl;
      link.download = `${baseName}-nipsa.png`;
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
          {images[0] && collections[0] ? (
            <section className="gallery-featured" aria-labelledby="gallery-featured-title">
              <button
                type="button"
                className="gallery-featured-image"
                aria-label={`View featured photograph: ${images[0].alt}`}
                onClick={() => selectImage(images[0] ?? null, true)}
              >
                <Image src={images[0].src} alt={images[0].alt} fill sizes="(max-width: 640px) 100vw, 30vw" priority />
              </button>
              <div className="gallery-featured-copy">
                <p className="eyebrow">Featured album</p>
                <h2 id="gallery-featured-title">{collections[0].title}</h2>
                <p>{collections[0].description}</p>
                <span>{collections[0].images.length} photographs · Original chapter images</span>
                <a href={`#gallery-${collections[0].slug}`}>Explore this album <span aria-hidden="true">→</span></a>
              </div>
            </section>
          ) : null}
          {collections.map((collection, collectionIndex) => (
            <section
              className={`gallery-collection${collectionIndex === 0 ? " gallery-collection--featured" : ""}`}
              key={collection.title}
              id={`gallery-${collection.slug}`}
              aria-labelledby={`gallery-collection-${collectionIndex}`}
            >
              <div className="gallery-collection-heading">
                <p className="eyebrow">{String(collectionIndex + 1).padStart(2, "0")} / PRACTICAL SESSION</p>
                <h2 id={`gallery-collection-${collectionIndex}`}>{collection.title}</h2>
                <p>{collection.description}</p>
                <span className="gallery-collection-count">
                  {collection.images.length} {collection.images.length === 1 ? "photograph" : "photographs"}
                </span>
              </div>
              <div className="gallery-grid">
                {collection.images.map((image, imageIndex) => {
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
                          priority={collectionIndex === 0 && imageIndex === 0}
                          className="gallery-image"
                        />
                      </button>
                      <figcaption className="gallery-item-caption">
                        <span>{image.caption ?? image.alt}</span>
                        {image.credit ? <small>{image.credit}</small> : null}
                      </figcaption>
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
          } else if (isGallery && event.key === "ArrowLeft") {
            event.preventDefault();
            navigateImage(-1);
          } else if (isGallery && event.key === "ArrowRight") {
            event.preventDefault();
            navigateImage(1);
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
        {isGallery && currentImage ? (
          <div className="gallery-lightbox-counter" aria-live="polite">
            {currentCollection?.title ?? currentImage.title}
            <span>Photo {collectionImageIndex + 1} of {currentCollection?.images.length ?? images?.length ?? 1}</span>
          </div>
        ) : null}
        <div className="gallery-lightbox-actions">
          {downloadError ? <p className="gallery-download-error" role="alert">{downloadError}</p> : null}
          <button
            type="button"
            className="gallery-lightbox-control"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            aria-pressed={isZoomed}
            onClick={toggleZoom}
          >
            {isZoomed ? "Zoom out" : "Zoom in"}
          </button>
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
            aria-label="Download watermarked copy"
            onClick={downloadWatermarkedImage}
            disabled={isDownloading}
          >
            {isDownloading ? "Preparing…" : "Download copy"}
          </button>
        </div>
        {currentImage ? (
          <div className="gallery-lightbox-caption">
            <strong>{currentImage.title}</strong>
            <p>{currentImage.caption ?? currentImage.alt}</p>
            <small>{currentImage.credit ? `Photo credit: ${currentImage.credit}` : "Photographer credit not supplied"}</small>
            <small>Original preview · NIPSA watermark is added to the downloaded copy only.</small>
          </div>
        ) : null}
        {(currentImage?.src || src) ? (
          <div
            className={`gallery-lightbox-image-stage${isZoomed ? " is-zoomed" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            aria-label={isZoomed ? "Zoomed photograph; drag to pan" : "Photograph preview"}
          >
            <Image
              src={currentImage?.src ?? src}
              alt={currentImage?.alt ?? alt}
              fill
              sizes="100vw"
              className="gallery-lightbox-image"
              style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isZoomed ? 1.8 : 1})` }}
              draggable={false}
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
