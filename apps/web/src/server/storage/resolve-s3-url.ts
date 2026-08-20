/**
 * Resolves a storage key to a URL.
 * If the value is already an absolute URL, it is returned as-is.
 * Safe to use in client components: the app serves the object itself, so no
 * deployment-specific host has to reach the browser.
 */
export function resolveS3Url(key: string): string {
  if (key.startsWith("http")) return key;
  return `/api/assets/${key}`;
}
