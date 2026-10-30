"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { CampusRecord } from "./data";
import styles from "./navigator.module.css";

type Props = { records: CampusRecord[]; selectedId: string | null; onSelect: (id: string) => void; onBrowseDirectory: () => void };

export default function CampusMap({ records, selectedId, onSelect, onBrowseDirectory }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "tiles-unavailable" | "unavailable">("loading");

  useEffect(() => {
    if (!enabled || !records.length || !container.current) return;
    let disposed = false;
    let instance: Leaflet.Map | null = null;
    const element = container.current;
    import("leaflet").then(L => {
      if (disposed) return;
      leaflet.current = L;
      instance = L.map(element, { scrollWheelZoom: false, maxZoom: 19 });
      map.current = instance;
      // Standard OSM tiles: no offline downloads, bulk prefetch or cache bypass.
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
        maxZoom: 19,
      });
      tiles.on("tileerror", () => { if (!disposed) setStatus("tiles-unavailable"); });
      tiles.addTo(instance);
      // The marker effect fits only verified destinations before the first map view.
      setStatus("ready");
      const observer = new ResizeObserver(() => instance?.invalidateSize());
      observer.observe(element);
      instance.on("unload", () => observer.disconnect());
    }).catch(() => { if (!disposed) setStatus("unavailable"); });
    return () => { disposed = true; instance?.remove(); map.current = null; leaflet.current = null; };
  }, [enabled, attempt, records.length]);

  useEffect(() => {
    if (!map.current || !leaflet.current || !["ready", "tiles-unavailable"].includes(status)) return;
    const L = leaflet.current;
    const currentMap = map.current;
    const group = L.layerGroup().addTo(currentMap);
    const points: Leaflet.LatLngExpression[] = [];
    for (const record of records) {
      if (!record.position) continue;
      const point: Leaflet.LatLngExpression = [record.position.latitude, record.position.longitude];
      points.push(point);
      const label = document.createElement("span");
      label.textContent = record.name;
      const marker = L.marker(point, {
        keyboard: true,
        title: record.name,
        alt: `Select ${record.name}`,
        icon: L.divIcon({
          className: `${styles.marker}${record.id === selectedId ? ` ${styles.markerSelected}` : ""}`,
          // Fixed literal markup only; record text is assigned with textContent above.
          html: '<span aria-hidden="true"></span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).bindTooltip(label).on("click", () => onSelect(record.id));
      marker.addTo(group);
    }
    const selected = records.find(record => record.id === selectedId);
    if (selected?.position) currentMap.setView([selected.position.latitude, selected.position.longitude], 18, { animate: false });
    else if (points.length) currentMap.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 16, animate: false });
    return () => { group.remove(); };
  }, [records, selectedId, onSelect, status, attempt]);

  if (!records.length) return (
    <section className={styles.mapPanel} aria-label="Campus mapping status">
      <div className={styles.mapHeading}>
        <div><span className={styles.eyebrow}>MAPPING IN PROGRESS</span><h2>No verified destinations to map yet</h2></div>
        <span className={styles.count}>0 mapped</span>
      </div>
      <div className={`${styles.mapConsent} ${styles.unmappedState}`}>
        <h3>The directory is your starting point.</h3>
        <p>Precise campus destinations are still being verified. Until then, explore the directory and its source notes. A general university reference point is not a building location.</p>
        <ol className={styles.mapRequirements}>
          <li>Confirm the official name and purpose.</li>
          <li>Verify the actual building or entrance coordinates.</li>
          <li>Publish its marker with clear source evidence.</li>
        </ol>
        <p>No campus pins, walking directions or map-navigation controls are offered without that evidence.</p>
        <button className={styles.primaryButton} onClick={onBrowseDirectory}>Browse directory</button>
      </div>
    </section>
  );

  return (
    <section className={styles.mapPanel} aria-label="Campus reference map">
      <div className={styles.mapHeading}>
        <div><span className={styles.eyebrow}>GEOGRAPHIC VIEW</span><h2>Verified map positions</h2></div>
        <span className={styles.count}>{records.length} mapped</span>
      </div>
      {!enabled ? (
        <div className={styles.mapConsent}>
          <span className={styles.mapGlyph} aria-hidden="true">◎</span>
          <h3>A real map. Only verified pins.</h3>
          <p>Select a verified destination on the map or in the directory.</p>
          <button className={styles.primaryButton} onClick={() => { setStatus("loading"); setEnabled(true); }}>Load interactive map <span aria-hidden="true">↗</span></button>
          <small>Loads map tiles from OpenStreetMap. Your browser connects to its servers. No geolocation is requested.</small>
        </div>
      ) : (
        <>
          <div className={styles.mapCanvas} ref={container} role="region" aria-label="Interactive geographic map; use zoom controls or drag to pan" />
          {status === "loading" && <p className={styles.mapNotice} role="status">Loading the interactive map…</p>}
          {status === "tiles-unavailable" || status === "unavailable" ? (
            <div className={styles.mapNotice} role="status">
              <p>{status === "unavailable" ? "The interactive map could not load." : "Some map tiles could not load. The base map may be incomplete."} The directory and available destination details remain usable.</p>
              <button className={styles.textButton} onClick={() => { setStatus("loading"); setAttempt(value => value + 1); }}>Retry map</button>
            </div>
          ) : null}
        </>
      )}
      <div className={styles.mapFoot}><span><i aria-hidden="true" /> Verified positions only</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors ↗</a></div>
    </section>
  );
}
