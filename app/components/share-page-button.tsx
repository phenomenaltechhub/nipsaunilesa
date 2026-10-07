"use client";

import { useId, useState } from "react";

type SharePageButtonProps = {
  title: string;
  text: string;
  url: string;
};

export default function SharePageButton({ title, text, url }: SharePageButtonProps) {
  const inputId = useId();
  const [status, setStatus] = useState("");
  const [showManualCopy, setShowManualCopy] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Page link copied.");
      setShowManualCopy(false);
      return true;
    } catch {
      setStatus("Copy this page link.");
      setShowManualCopy(true);
      return false;
    }
  }

  async function sharePage() {
    setStatus("");
    setShowManualCopy(false);

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setStatus("Page shared.");
        return;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AbortError"
        ) {
          return;
        }
      }
    }

    await copyUrl();
  }

  return (
    <span>
      <button className="button secondary" type="button" onClick={sharePage}>
        Share
      </button>
      <span role="status" aria-live="polite">{status}</span>
      {showManualCopy ? (
        <span>
          <label htmlFor={inputId}>Copy this page link</label>
          <input
            id={inputId}
            type="url"
            value={url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <button className="button secondary" type="button" onClick={copyUrl}>
            Copy link
          </button>
        </span>
      ) : null}
    </span>
  );
}
