"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navItems } from "../config/navigation";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function getPortalHref(): string {
  return "/portal";
}

const portalHref = getPortalHref();

function BrandLink() {
  return (
    <Link className="brand" href="/">
      <span className="brand-logos" aria-label="NIPSA and University of Ilesa branding">
        <img className="brand-logo brand-logo--nipsa" src="/nipsa-logo.png" alt="NIPSA logo" />
        <span className="brand-divider" aria-hidden="true" />
        <img className="brand-logo brand-logo--crest" src="/unilesa-logo.png" alt="University of Ilesa logo" />
      </span>
      <span className="brand-copy">
        <span className="brand-name">NIPSA-UNILESA</span>
        <span className="brand-subtitle">UNILESA – Department of Pharmacology</span>
      </span>
    </Link>
  );
}

export default function Header({ currentPath = "/" }: { currentPath?: string }) {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastDirection = 0;
    let accumulatedDistance = 0;
    let animationFrame = 0;

    setIsScrolled(lastY > 32);

    const updateScrollState = () => {
      animationFrame = 0;
      const currentY = window.scrollY;

      if (currentY <= 32) {
        lastY = currentY;
        lastDirection = 0;
        accumulatedDistance = 0;
        setIsScrolled(false);
        setIsHidden(false);
        return;
      }

      setIsScrolled(true);

      const delta = currentY - lastY;
      lastY = currentY;

      if (Math.abs(delta) < 1) {
        return;
      }

      const direction = delta > 0 ? 1 : -1;
      if (direction !== lastDirection) {
        accumulatedDistance = 0;
        lastDirection = direction;
      }

      accumulatedDistance += Math.abs(delta);

      if (currentY > 180 && direction > 0 && accumulatedDistance >= 28) {
        if (!headerRef.current?.contains(document.activeElement)) {
          setIsHidden(true);
        }
        accumulatedDistance = 0;
      } else if (direction < 0 && accumulatedDistance >= 14) {
        setIsHidden(false);
        accumulatedDistance = 0;
      }
    };

    const onScroll = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        const focusIsInMenu = headerRef.current?.contains(document.activeElement);
        const clickedFocusable =
          event.target instanceof Element &&
          event.target.closest("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
        setIsMenuOpen(false);
        if (focusIsInMenu && !clickedFocusable) {
          window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        }
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
      return;
    }

    setIsMenuOpen(true);
  };

  return (
    <header
      ref={headerRef}
      className={`site-header${isScrolled ? " is-scrolled" : ""}${isHidden ? " is-hidden" : ""}`}
    >
      <nav className="nav container" aria-label="Site header">
        <BrandLink />
        <div className="header-controls">
          <Link className="portal-button" href={portalHref}>
            Student Portal <Arrow />
          </Link>
          <button
            ref={menuButtonRef}
            className="nav-menu-trigger"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation-overlay"
            onClick={toggleMenu}
          >
            <span>{isMenuOpen ? "Close" : "Menu"}</span>
            <span className="nav-menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <div
          id="site-navigation-overlay"
          className={`nav-overlay${isMenuOpen ? " is-open" : ""}`}
          aria-hidden={!isMenuOpen}
          inert={!isMenuOpen}
        >
          <div className="nav-overlay-inner">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-overlay-link${item.href === currentPath ? " active" : ""}`}
                aria-current={item.href === currentPath ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
