"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { filterTourDestinations } from "./content";
import styles from "./tour.module.css";

export default function TourDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const destinations = filterTourDestinations(query, category);
  return <section className={styles.directory} id="tour-destinations" aria-labelledby="tour-sections-title">
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore the website</p><h2 id="tour-sections-title">Find your next step.</h2></div><p>You can use every link here without watching the video.</p></div>
    <div className={styles.filters}>
      <label>Find a section<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try resources, GPA or gallery" /></label>
      <label>Section category<select value={category} onChange={(event) => setCategory(event.target.value)}>{["All", "Academic", "Chapter", "Explore"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <p role="status" aria-live="polite">{destinations.length} {destinations.length === 1 ? "section" : "sections"}</p>
    </div>
    <div className={styles.destinationGrid}>
      {destinations.map((destination) => <article key={destination.id} className={`${styles.destination} ${destination.featured ? styles.featured : ""}`}>
        <div className={styles.destinationImage}><Image src={destination.image} alt={destination.imageAlt} width={960} height={675} loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw" /></div>
        <div className={styles.destinationCopy}><p className={styles.destinationCategory}>{destination.category}</p><h3>{destination.title}</h3><p>{destination.description}</p><div className={styles.destinationLinks}><Link href={destination.href}>{destination.linkLabel}<span aria-hidden="true">→</span></Link>{destination.secondary && <Link href={destination.secondary.href}>{destination.secondary.label}<span aria-hidden="true">→</span></Link>}{destination.status && <span className={styles.previewLabel}>{destination.status}</span>}</div></div>
      </article>)}
    </div>
    {destinations.length === 0 && <div className={styles.emptyState}><h3>No matching sections</h3><p>Try another word or clear the filters.</p><button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
  </section>;
}
