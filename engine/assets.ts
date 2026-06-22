// Typed image loader/cache. Replaces the ad-hoc `new Image(); img.src = ...`
// scattered through run.js. Images are cached by src so re-selecting a location
// or weather doesn't reload artwork. Safe to call during SSR (returns null).

const cache = new Map<string, HTMLImageElement>();

/**
 * Returns a cached <img> for the src, kicking off a load on first request.
 * The element may not be loaded yet; canvas drawImage simply skips images with
 * zero natural size, so callers can draw every frame without awaiting.
 */
export function getImage(src: string): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    // Allow drawing CDN weather icons to the canvas without tainting issues
    // (we never read pixels back).
    img.crossOrigin = "anonymous";
    img.src = src;
    cache.set(src, img);
  }
  return img;
}

/** True when an image is loaded and has drawable dimensions. */
export function isReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}
