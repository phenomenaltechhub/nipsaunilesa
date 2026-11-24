"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { dismissalKey, safetyNotice, noticeIsActive, shouldAutoShow } from "./content";
import styles from "./safety.module.css";

const remembered = new Set<string>();
const token = `${safetyNotice.id}:${safetyNotice.version}`;
function storedVersion() {
  if (remembered.has(token)) return token;
  try { return window.localStorage.getItem(dismissalKey); } catch { return null; }
}
function Shield() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg>;
}
export default function StudentSafetyNotice() {
  const dialog = useRef<HTMLDialogElement>(null);
  const entry = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const overflow = useRef<string | null>(null);

  function restore(focus = true) {
    if (overflow.current !== null) {
      document.documentElement.style.overflow = overflow.current;
      overflow.current = null;
    }
    const target = opener.current;
    opener.current = null;
    if (focus && target?.isConnected) target.focus({ preventScroll: true });
  }
  function open(manual = false) {
    const element = dialog.current;
    if (!element || element.open || !noticeIsActive(safetyNotice)) return;
    // Never compete with the Gallery or another currently active dialog.
    if (document.querySelector("dialog[open]")) return;
    opener.current = manual && document.activeElement instanceof HTMLElement ? document.activeElement : entry.current;
    overflow.current = document.documentElement.style.overflow;
    element.showModal();
    document.documentElement.style.overflow = "hidden";
    element.scrollTop = 0;
    if (body.current) body.current.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });
  }
  function dismiss() {
    remembered.add(token);
    try { window.localStorage.setItem(dismissalKey, token); } catch { /* Non-sensitive in-memory fallback above. */ }
    dialog.current?.close();
  }
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let disposed = false;
    const element = dialog.current;
    function attempt() {
      if (disposed || !shouldAutoShow(safetyNotice, storedVersion()) || element?.open) return;
      if (document.querySelector("dialog[open]")) { timer = setTimeout(attempt, 500); return; }
      open();
    }
    timer = setTimeout(attempt, 600);
    return () => { disposed = true; clearTimeout(timer); if (element?.open) element.close(); restore(false); };
    // Static notice version; the effect is intentionally tied to this homepage mount.
  }, []);

  if (!noticeIsActive(safetyNotice)) return null;
  return <>
    <button ref={entry} type="button" className={styles.entry} onClick={() => open(true)}><Shield /><span>Student Safety Notice</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" style={{ display: "inline", verticalAlign: "middle" }}><path d="M7 17 17 7M7 7h10v10" /></svg></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="student-safety-heading" aria-describedby="student-safety-intro" onCancel={event => { event.preventDefault(); dismiss(); }} onClose={() => restore()} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const items = dialog.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.brand}><Image src="/nipsa-logo.png" alt="NIPSA UNILESA" width={42} height={42} /><span>NIPSA UNILESA<small>Student information &amp; guidance</small></span></div>
          <button className={styles.close} type="button" aria-label="Close Student Safety Notice" onClick={dismiss}>×</button>
        </header>
        <div ref={body} className={styles.body}>
          <div className={styles.title}><Shield /><h2 id="student-safety-heading" ref={heading} tabIndex={-1}>{safetyNotice.title}</h2></div>
          <p id="student-safety-intro" className={styles.intro}>{safetyNotice.intro}</p>
          {safetyNotice.sections.map(section => <section key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
          <p className={styles.closing}>{safetyNotice.closing}</p>
          <a className={styles.university} href={safetyNotice.links[1].href} target="_blank" rel="noopener noreferrer">{safetyNotice.links[1].label} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" style={{ display: "inline", verticalAlign: "middle" }}><path d="M7 17 17 7M7 7h10v10" /></svg><small>unilesa.edu.ng · opens in a new tab</small></a>
        </div>
        <footer className={styles.footer}><button type="button" className={styles.primary} onClick={dismiss}>I Understand</button><Link className={styles.secondary} href={safetyNotice.links[0].href} onClick={dismiss}>{safetyNotice.links[0].label}</Link></footer>
      </div>
    </dialog>
  </>;
}
