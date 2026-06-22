"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGeolocation } from "@/hooks/useGeolocation";
import { LOCATION_ORDER, LOCATIONS, matchDefinedCity } from "@/lib/locations";
import { useWeatherStore } from "@/lib/store";
import type { GeocodeResult, LocationKey } from "@/lib/types";

// Unified location control: the bar shows the current city as a compact chip;
// tapping opens one panel with a search field on top and the preset cities
// below. Search and presets live together, replacing the separate pill row +
// detached magnifier. Reuses the store actions and the geocoding search.

function PinIcon() {
  return (
    <svg className="pin" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </svg>
  );
}

export function LocationPicker() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedValue(query, 350);

  const locationKey = useWeatherStore((s) => s.locationKey);
  const displayName = useWeatherStore((s) => s.displayName);
  const currentName = useWeatherStore((s) => s.current?.locationName);
  const selectLocation = useWeatherStore((s) => s.selectLocation);
  const selectMyLocation = useWeatherStore((s) => s.selectMyLocation);
  const requestGeolocation = useGeolocation();

  const label = displayName ?? currentName ?? "Location";
  const q = debounced.trim();
  const searching = q.length >= 3;

  useEffect(() => {
    if (q.length < 3) return;
    let cancelled = false;
    fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { results?: GeocodeResult[] }) => {
        if (!cancelled) {
          setResults(d.results ?? []);
          setActive(0);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }

  function applyResult(r: GeocodeResult) {
    const key = matchDefinedCity(r.lat, r.lon);
    if (key) selectLocation(key);
    else selectMyLocation({ lat: r.lat, lon: r.lon }, r.name);
    close();
  }

  function applyPreset(key: LocationKey) {
    if (key === "mylocation") requestGeolocation();
    else selectLocation(key);
    close();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setLoading(value.trim().length >= 3);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    } else if (searching && e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (searching && e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (searching && e.key === "Enter") {
      e.preventDefault();
      if (results[active]) applyResult(results[active]);
    }
  }

  return (
    <div className="locationPicker" ref={wrapRef}>
      <button
        type="button"
        className="locationChip"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <PinIcon />
        <span className="locationChipName">{label}</span>
        <ChevronIcon />
      </button>

      {open && (
        <div className="locationPanel" role="dialog" aria-label="Choose location">
          <div className="searchBox">
            <SearchIcon />
            <input
              ref={inputRef}
              className="searchInput"
              type="text"
              aria-label="Search city"
              placeholder="Search any city…"
              value={query}
              onChange={onChange}
              onKeyDown={onKeyDown}
            />
          </div>

          {searching ? (
            <ul className="locationResults" role="listbox">
              {loading && <li className="searchHint">Searching…</li>}
              {!loading && results.length === 0 && (
                <li className="searchHint">No matches</li>
              )}
              {!loading &&
                results.map((r, i) => (
                  <li
                    key={`${i}-${r.lat},${r.lon}`}
                    role="option"
                    aria-selected={i === active}
                    className={`searchResult${i === active ? " searchResultActive" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyResult(r);
                    }}
                  >
                    {r.label}
                  </li>
                ))}
            </ul>
          ) : (
            <div className="presetGrid" role="listbox" aria-label="Saved locations">
              {LOCATION_ORDER.map((key) => {
                const activeKey = key === locationKey;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={activeKey}
                    className={`pill${activeKey ? " pillActive" : ""}`}
                    onClick={() => applyPreset(key)}
                  >
                    {LOCATIONS[key].label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
