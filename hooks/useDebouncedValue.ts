"use client";

import { useEffect, useState } from "react";

// Returns `value` delayed by `ms` — updates only after the input stops changing.
// Used to debounce the location-search query before hitting the geocoding API.

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);

  return debounced;
}
