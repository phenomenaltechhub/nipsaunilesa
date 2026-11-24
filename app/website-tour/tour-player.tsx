"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { tourDescription, tourMedia } from "./content";
import styles from "./tour.module.css";

export function formatTourTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function PlayIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 5 11 7-11 7V5Z" /></svg>;
}

export default function TourPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const [started, setStarted] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [playbackNote, setPlaybackNote] = useState("");

  function revealPlayer() {
    const element = video.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" });
  }

  function playAt(seconds?: number) {
    const element = video.current;
    if (!element) return;
    setStarted(true);
    setPlaybackNote("");
    if (seconds !== undefined) {
      if (element.readyState >= 1) element.currentTime = seconds;
      else pendingSeek.current = seconds;
    }
    revealPlayer();
    element.play().catch(() => setPlaybackNote("Use the video’s Play control to begin, or read the transcript below."));
    window.requestAnimationFrame(() => element.focus());
  }

  function openTranscript() {
    const transcript = document.getElementById("tour-transcript");
    if (transcript instanceof HTMLDetailsElement) transcript.open = true;
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="tour-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Your chapter. Your guide.</p>
          <h1 id="tour-title">Website Tour</h1>
          <p className={styles.heroHeading}>Explore NIPSA<br />UNILESA.</p>
          <p className={styles.lead}>{tourDescription}</p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={() => playAt()}><PlayIcon /> Watch the walkthrough</button>
            <a className={styles.secondary} href="#tour-destinations">Explore sections <span aria-hidden="true">↓</span></a>
          </div>
          <p className={styles.heroNote}>For new students, continuing students and visitors.</p>
        </div>

        <div className={styles.heroFilm}>
          <div className={styles.film} id="tour-video">
            <div className={styles.filmTop}><span>The website, in action</span><span>{formatTourTime(tourMedia.durationSeconds)} · English narration</span></div>
            <div className={styles.videoStage}>
              <video
                ref={video}
                controls={started}
                playsInline
                preload="none"
                poster={tourMedia.poster}
                aria-label="NIPSA UNILESA narrated website walkthrough"
                tabIndex={started ? 0 : -1}
                onPlay={() => setStarted(true)}
                onError={() => setMediaError(true)}
                onLoadedMetadata={() => {
                  if (pendingSeek.current !== null && video.current) {
                    video.current.currentTime = pendingSeek.current;
                    pendingSeek.current = null;
                  }
                }}
                onTimeUpdate={() => {
                  const time = video.current?.currentTime ?? 0;
                  const index = tourMedia.chapters.findLastIndex((chapter) => chapter.start <= time);
                  setActiveChapter(Math.max(0, index));
                }}
              >
                <source src={tourMedia.src} type="video/mp4" onError={() => setMediaError(true)} />
                <track kind="captions" src={tourMedia.captions} srcLang="en" label="English" default />
                Your browser does not support this video. <a href={tourMedia.src}>Download the walkthrough</a> or read the transcript below.
              </video>
              {!started && !mediaError && <button className={styles.playCover} type="button" onClick={() => playAt()} aria-label="Play the narrated Website Tour"><span className={styles.playCircle}><PlayIcon /></span><span>Watch the website walkthrough<small>{formatTourTime(tourMedia.durationSeconds)} · Captions and transcript available</small></span></button>}
            </div>
            <div className={styles.filmBottom}><a href="#tour-transcript" onClick={openTranscript}>Read transcript <span aria-hidden="true">↓</span></a><a href={tourMedia.src} download>Download video</a></div>
          </div>
          {mediaError && <p className={styles.mediaNotice} role="alert">The video could not load. <a href={tourMedia.src}>Try the video directly</a>, read the transcript or explore the section links below.</p>}
          {playbackNote && <p className={styles.mediaNotice} role="status">{playbackNote}</p>}
          <p className={styles.filmCaption}>Real website interactions. Pause, replay or explore at your own pace.</p>
        </div>
      </section>

      <section className={styles.chapterSection} aria-labelledby="chapters-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>A clear route through the website</p><h2 id="chapters-title">One tour. Your own pace.</h2></div><p>Jump to a chapter, or follow the complete walkthrough.</p></div>
        <div className={styles.chapters} role="group" aria-label="Video chapters">
          {tourMedia.chapters.map((chapter, index) => <button key={chapter.id} type="button" aria-pressed={activeChapter === index} onClick={() => playAt(chapter.start)} className={styles.chapter}><span className={styles.chapterNumber}>{String(index + 1).padStart(2, "0")}</span><span>{chapter.title}</span><span className={styles.chapterTime}>{formatTourTime(chapter.start)}</span></button>)}
        </div>
        <details id="tour-transcript" className={styles.transcript}>
          <summary>Read the full walkthrough transcript <span aria-hidden="true">＋</span></summary>
          <div className={styles.transcriptBody}>
            <p><a href="/media/website-tour/transcript.txt" download>Download the text transcript</a> · <a href={tourMedia.captions} download>Download English captions</a></p>
            {tourMedia.chapters.map((chapter) => <section key={chapter.id}><h3>{formatTourTime(chapter.start)} — {chapter.title}</h3>{chapter.paragraphs.map((text, index) => <p key={index}>{text}</p>)}<Link href={chapter.path}>Explore this section <span aria-hidden="true">→</span></Link></section>)}
          </div>
        </details>
      </section>
    </>
  );
}
