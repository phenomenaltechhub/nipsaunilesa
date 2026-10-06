"use client";

import { useId, useState } from "react";

type AdShareButtonProps = {
  businessName: string;
  description: string;
  url: string;
};

export default function AdShareButton({ businessName, description, url }: AdShareButtonProps) {
  const inputId = useId();
  const [status, setStatus] = useState("");
  const [showManualCopy, setShowManualCopy] = useState(false);

  const copyUrl = async () => {
    if (!navigator.clipboard?.writeText) return false;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Ad link copied");
      setShowManualCopy(false);
      return true;
    } catch {
      return false;
    }
  };

  const share = async () => {
    setStatus("");
    setShowManualCopy(false);

    if (navigator.share) {
      try {
        await navigator.share({ title: businessName, text: description, url });
        return;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AbortError"
        ) return;
      }
    }

    if (!(await copyUrl())) {
      setStatus("Copy this ad link");
      setShowManualCopy(true);
    }
  };

  return (
    <span className="ads-share">
      <button
        className="ads-share__button"
        type="button"
        aria-label={`Share ${businessName} ad`}
        onClick={share}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v7h14v-7" />
        </svg>
        <span>Share</span>
      </button>
      <span className="ads-share__status" role="status" aria-live="polite">{status}</span>
      {showManualCopy ? (
        <div className="ads-share__manual">
          <label htmlFor={inputId}>
            Copy this ad link
          </label>
          <input
            id={inputId}
            type="url"
            value={url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <button type="button" onClick={copyUrl}>Copy link</button>
        </div>
      ) : null}
    </span>
  );
}
