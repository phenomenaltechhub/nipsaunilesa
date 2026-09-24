"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "nipsa-guided-tour-dismissed";

const steps = [
  {
    selector: '[aria-label="Main navigation"]',
    title: "Explore the site",
    description: "The main navigation gives you access to the website's major sections.",
  },
  {
    selector: ".portal-button, .mobile-portal-link",
    title: "Student Portal",
    description: "The Portal is your student-focused academic hub for study support, resources, tools, and useful information.",
  },
  {
    selector: 'a[href="/resources"]',
    title: "Resources",
    description: "Find available academic and student-support materials in the Resources section.",
  },
  {
    selector: 'a[href="/announcements"]',
    title: "Events & announcements",
    description: "Keep up with NIPSA activities, academic notices, events, and updates.",
  },
  {
    selector: 'a[href="/community"]',
    title: "Community",
    description: "Connect through study circles, mentorship, campus updates, and community information.",
  },
];

export default function GuidedTour() {
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    previousFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== "true") {
      const activeElement = document.activeElement;
      previousFocusRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null;
      const frame = window.requestAnimationFrame(() => setOpen(true));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const updateTarget = () => {
      const target = Array.from(document.querySelectorAll<HTMLElement>(steps[stepIndex].selector))
        .find((element) => element.getClientRects().length > 0);
      setTargetRect(target?.getBoundingClientRect() ?? null);
    };

    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key === "ArrowRight" && stepIndex < steps.length - 1) setStepIndex((current) => current + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex((current) => current - 1);
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === dialogRef.current || document.activeElement === first)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === dialogRef.current || document.activeElement === last)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss, open, stepIndex]);

  if (!open) return null;

  const step = steps[stepIndex];
  const tooltipTop = targetRect ? Math.min(window.innerHeight - 250, Math.max(20, targetRect.bottom + 18)) : 100;
  const tooltipLeft = targetRect ? Math.min(window.innerWidth - 340, Math.max(16, targetRect.left)) : 16;

  return (
    <div className="guided-tour-layer" role="presentation" onClick={(event) => {
      if (event.target === event.currentTarget) dismiss();
    }}>
      {targetRect && (
        <div
          className="guided-tour-spotlight"
          aria-hidden="true"
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}
      <div
        ref={dialogRef}
        className="guided-tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        aria-describedby="guided-tour-description"
        tabIndex={-1}
        style={{ top: `${tooltipTop}px`, left: `${tooltipLeft}px` }}
      >
        <p className="guided-tour-count">Tour {stepIndex + 1} of {steps.length}</p>
        <h2 id="guided-tour-title">{step.title}</h2>
        <p id="guided-tour-description">{step.description}</p>
        <div className="guided-tour-actions">
          <button type="button" className="guided-tour-skip" onClick={dismiss}>Skip Tour</button>
          <div className="guided-tour-navigation">
            {stepIndex > 0 && <button type="button" className="guided-tour-back" onClick={() => setStepIndex((current) => current - 1)}>Back</button>}
            <button type="button" className="guided-tour-next" onClick={() => stepIndex === steps.length - 1 ? dismiss() : setStepIndex((current) => current + 1)}>
              {stepIndex === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
