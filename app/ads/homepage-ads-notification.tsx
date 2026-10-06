"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, RefObject } from "react";
import {
  advertisements,
  sanitizePublicAdCopy,
  validateHomepageNotification,
  type Advertisement,
} from "./data";

const batchSize = 5;
const stackSize = 136;
const viewportGutter = 12;
const rotationInterval = 45_000;
const positionStorageKey = "nipsa-ads-notification-position";
const dismissedStorageKey = "nipsa-ads-notification-dismissed";

type Point = { x: number; y: number };

function isPoint(value: unknown): value is Point {
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    "y" in value &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y)
  );
}

const previewAdvertisements = advertisements.filter((ad) =>
  validateHomepageNotification(ad.homepageNotification),
);

function clampPoint(point: Point): Point {
  return {
    x: Math.min(
      Math.max(viewportGutter, point.x),
      Math.max(viewportGutter, document.documentElement.clientWidth - stackSize - viewportGutter),
    ),
    y: Math.min(
      Math.max(viewportGutter, point.y),
      Math.max(viewportGutter, window.innerHeight - stackSize - viewportGutter),
    ),
  };
}

function getDefaultPoint(): Point {
  return clampPoint({
    x: document.documentElement.clientWidth - stackSize - 24,
    y: window.innerHeight - stackSize - 28,
  });
}

function getDismissTarget(point: Point): DOMRect {
  const targetSize = 116;
  const x = Math.min(
    Math.max(viewportGutter, point.x + (stackSize - targetSize) / 2),
    Math.max(viewportGutter, document.documentElement.clientWidth - targetSize - viewportGutter),
  );
  const y = point.y + stackSize + targetSize + viewportGutter <= window.innerHeight
    ? point.y + stackSize + viewportGutter
    : Math.max(viewportGutter, point.y - targetSize - viewportGutter);

  return new DOMRect(x, y, targetSize, targetSize);
}

function isPointInside(point: Point, rect: DOMRect) {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function getActionName(href: string) {
  const url = href.toLowerCase();
  if (url.startsWith("mailto:")) return "Email";
  if (url.startsWith("tel:")) return "Call";
  if (url.includes("wa.me") || url.includes("whatsapp")) return "WhatsApp";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("tiktok.com")) return "TikTok";
  return "Contact";
}

function getPrimaryContact(ad: Advertisement) {
  if (ad.contactHref) return { href: ad.contactHref, label: getActionName(ad.contactHref) };
  if (ad.phone) return { href: `tel:${ad.phone.replace(/\s+/g, "")}`, label: "Call" };
  if (ad.email) return { href: `mailto:${ad.email}`, label: "Email" };
  return null;
}

function AdNotificationCard({
  ad,
  index,
  count,
  panelRef,
  style,
  onNext,
  onClose,
  onDismiss,
}: {
  ad: Advertisement;
  index: number;
  count: number;
  panelRef: RefObject<HTMLElement | null>;
  style: CSSProperties;
  onNext: () => void;
  onClose: () => void;
  onDismiss: () => void;
}) {
  const contact = getPrimaryContact(ad);

  return (
    <section
      ref={panelRef}
      className="ads-discovery-panel"
      style={style}
      aria-label="Advertisement preview"
      aria-live="polite"
      data-no-drag
    >
      <div className="ads-discovery-panel__visual" aria-hidden="true">
        <Image src={ad.image} alt="" fill sizes="72px" unoptimized />
        <span className="ads-discovery-panel__visual-wash" />
      </div>
      <div className="ads-discovery-panel__body">
        <div className="ads-discovery-panel__heading">
          <div>
            <p>{ad.category}{ad.subcategory ? ` · ${ad.subcategory}` : ""}</p>
            <h2>{ad.businessName}</h2>
          </div>
          <button
            className="ads-discovery-panel__close"
            type="button"
            aria-label="Close advertisement preview"
            onClick={onClose}
            data-no-drag
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <p className="ads-discovery-panel__copy">
          {sanitizePublicAdCopy(ad.homepageNotification)}
        </p>
        <div className="ads-discovery-panel__actions">
          <Link className="ads-discovery-panel__view" href="/ads" data-no-drag>
            View Ads <span aria-hidden="true">↗</span>
          </Link>
          {contact ? (
            <a
              className="ads-discovery-panel__contact"
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
              data-no-drag
            >
              {contact.label}
            </a>
          ) : null}
          <button className="ads-discovery-panel__next" type="button" onClick={onNext} data-no-drag>
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="ads-discovery-panel__footer">
          <span>{index + 1} / {count}</span>
          <div className="ads-discovery-panel__progress" aria-hidden="true">
            {Array.from({ length: count }, (_, itemIndex) => (
              <span key={itemIndex} className={itemIndex === index ? "is-active" : undefined} />
            ))}
          </div>
          <button type="button" onClick={onDismiss} data-no-drag>
            Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomepageAdsNotification() {
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState<Point | null>(null);
  const [batchOffset, setBatchOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissTargetPosition, setDismissTargetPosition] = useState<Point | null>(null);
  const [panelPosition, setPanelPosition] = useState<Point | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const pointerStartRef = useRef<Point | null>(null);
  const dragOriginRef = useRef<Point | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const pointRef = useRef<Point | null>(null);
  const dismissTargetRef = useRef<DOMRect | null>(null);

  const batch = useMemo(() => {
    if (!previewAdvertisements.length) return [];
    const count = Math.min(batchSize, previewAdvertisements.length);
    return Array.from({ length: count }, (_, index) =>
      previewAdvertisements[(batchOffset + index) % previewAdvertisements.length],
    );
  }, [batchOffset]);
  const currentAd = batch[currentIndex] ?? batch[0];
  const setWidgetPosition = useCallback((next: Point, persist: boolean) => {
    const clamped = clampPoint(next);
    pointRef.current = clamped;
    setPosition(clamped);

    if (persist) {
      try {
        window.sessionStorage.setItem(positionStorageKey, JSON.stringify(clamped));
      } catch (error) {
        console.warn("Could not save the Ads notification position for this session.", error);
      }
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setIsOpen(false);
    try {
      window.sessionStorage.setItem(dismissedStorageKey, "true");
    } catch (error) {
      console.warn("Could not save the Ads notification dismissal for this session.", error);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setDismissed(window.sessionStorage.getItem(dismissedStorageKey) === "true");
        const storedPosition = window.sessionStorage.getItem(positionStorageKey);
        if (storedPosition) {
          const parsed: unknown = JSON.parse(storedPosition);
          if (isPoint(parsed)) {
            setWidgetPosition(parsed, false);
          } else {
            setWidgetPosition(getDefaultPoint(), false);
          }
        } else {
          setWidgetPosition(getDefaultPoint(), false);
        }
      } catch (error) {
        console.warn("Could not restore the Ads notification state for this session.", error);
        setWidgetPosition(getDefaultPoint(), false);
      }
    });

    const onResize = () => {
      const current = pointRef.current ?? getDefaultPoint();
      setWidgetPosition(current, true);
    };
    const viewportObserver = new ResizeObserver(onResize);
    viewportObserver.observe(document.documentElement);
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      viewportObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [setWidgetPosition]);

  useEffect(() => {
    advertisements.forEach((ad) => {
      if (ad.homepageNotification.trim() && !validateHomepageNotification(ad.homepageNotification)) {
        console.error(
          `The homepageNotification for "${ad.businessName}" must contain 1–2 short sentences.`,
        );
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen || isDragging || previewAdvertisements.length <= batchSize) return;
    const timer = window.setInterval(() => {
      setBatchOffset((offset) => (offset + 1) % previewAdvertisements.length);
      setCurrentIndex(0);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [isOpen, isDragging]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !position || !panelRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const opensLeft = position.x + stackSize / 2 > window.innerWidth / 2;
    const opensUp = position.y + stackSize / 2 > window.innerHeight / 2;
    const x = opensLeft
      ? position.x - panelRect.width - 12
      : position.x + stackSize + 12;
    const y = opensUp
      ? position.y - panelRect.height - 12
      : position.y + stackSize + 12;

    setPanelPosition({
      x: Math.min(
        Math.max(viewportGutter, x),
        Math.max(viewportGutter, document.documentElement.clientWidth - panelRect.width - viewportGutter),
      ),
      y: Math.min(Math.max(viewportGutter, y), Math.max(viewportGutter, window.innerHeight - panelRect.height - viewportGutter)),
    });
  }, [isOpen, position, currentAd]);

  if (dismissed || !currentAd || !previewAdvertisements.length) return null;

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target instanceof Element && event.target.closest("[data-no-drag]"))) {
      return;
    }
    const start = { x: event.clientX, y: event.clientY };
    const origin = position ?? getDefaultPoint();
    pointerIdRef.current = event.pointerId;
    pointerStartRef.current = start;
    dragOriginRef.current = origin;
    const dismissTarget = getDismissTarget(origin);
    dismissTargetRef.current = dismissTarget;
    setDismissTargetPosition({ x: dismissTarget.x, y: dismissTarget.y });
    setIsDragging(true);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || !pointerStartRef.current || !dragOriginRef.current) return;
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      didDragRef.current = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    setWidgetPosition(
      { x: dragOriginRef.current.x + dx, y: dragOriginRef.current.y + dy },
      false,
    );
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const point = pointRef.current ?? position ?? getDefaultPoint();
    const target = dismissTargetRef.current;
    if (didDragRef.current && target && isPointInside({ x: event.clientX, y: event.clientY }, target)) {
      dismiss();
    } else {
      setWidgetPosition(point, true);
    }
    pointerIdRef.current = null;
    pointerStartRef.current = null;
    dragOriginRef.current = null;
    setIsDragging(false);
    dismissTargetRef.current = null;
    setDismissTargetPosition(null);
    if (didDragRef.current) {
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 100);
    }
  };

  const cancelDrag = () => {
    pointerIdRef.current = null;
    pointerStartRef.current = null;
    dragOriginRef.current = null;
    didDragRef.current = false;
    setIsDragging(false);
    dismissTargetRef.current = null;
    setDismissTargetPosition(null);
  };

  const cssPosition = position
    ? {
        left: `max(${viewportGutter}px, min(${position.x}px, calc(100vw - ${stackSize + viewportGutter}px)))`,
        top: `max(${viewportGutter}px, min(${position.y}px, calc(100dvh - ${stackSize + viewportGutter}px)))`,
        right: "auto",
        bottom: "auto",
      }
    : undefined;

  return (
    <>
      <div
        className={`ads-discovery-widget${isOpen ? " is-open" : ""}${isDragging ? " is-dragging" : ""}`}
        style={cssPosition}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        onClick={(event) => {
          if (!(event.target instanceof Element) || !event.target.closest(".ads-discovery-stack__primary")) {
            return;
          }
          if (didDragRef.current) {
            didDragRef.current = false;
            return;
          }
          setIsOpen((open) => !open);
        }}
      >
        <div className="ads-discovery-stack" aria-label="Discover student advertisements">
          <div className="ads-discovery-stack__thumbnails" aria-hidden="true">
            {batch.map((ad, index) => (
              <span className={`ads-discovery-stack__thumbnail ads-discovery-stack__thumbnail--${index}`} key={ad.id}>
                <Image src={ad.image} alt="" fill sizes="340px" unoptimized />
              </span>
            ))}
          </div>
          <button
            className="ads-discovery-stack__primary"
            type="button"
            aria-label={isOpen ? "Advertisement previews open" : "View Ads"}
            aria-expanded={isOpen}
          >
            <span aria-hidden="true" className="ads-discovery-stack__mark">
              <svg viewBox="0 0 24 24">
                <path d="M4 6.5h16v12H4zM7 4h10M8 10h8M8 14h5" />
              </svg>
            </span>
            <span>View Ads</span>
          </button>
          <button
            type="button"
            className="ads-discovery-stack__dismiss"
            aria-label="Dismiss Ads notification for this session"
            title="Dismiss for this session"
            onClick={dismiss}
            data-no-drag
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {isDragging && dismissTargetPosition ? (
          <div
            className="ads-discovery-dismiss-target"
            style={{ left: dismissTargetPosition.x, top: dismissTargetPosition.y }}
            aria-hidden="true"
          >
            <span>Drop to dismiss</span>
          </div>
        ) : null}

        {isOpen && currentAd ? (
          <AdNotificationCard
            ad={currentAd}
            index={currentIndex}
            count={batch.length}
            panelRef={panelRef}
            style={{
              left: panelPosition?.x ?? viewportGutter,
              top: panelPosition?.y ?? viewportGutter,
              visibility: panelPosition ? "visible" : "hidden",
            }}
            onNext={() => {
              setCurrentIndex((index) => (index + 1) % batch.length);
              setPanelPosition(null);
            }}
            onClose={() => setIsOpen(false)}
            onDismiss={dismiss}
          />
        ) : null}
      </div>
    </>
  );
}
