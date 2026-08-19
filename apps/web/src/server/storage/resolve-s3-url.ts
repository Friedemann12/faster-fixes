declare global {
  interface Window {
    __STORAGE_PUBLIC_URL__?: string;
  }
}

/**
 * Base URL of the public bucket. Deliberately not a `NEXT_PUBLIC_*` variable:
 * those are inlined at build time, which would bake the deployment's domain into
 * the image and force a rebuild to change it. The server reads the env directly,
 * the browser reads the value the root layout injects on every request.
 */
function storageBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.STORAGE_PUBLIC_URL ?? "";
  }

  return window.__STORAGE_PUBLIC_URL__ ?? "";
}

/**
 * Resolves an S3 key to a full URL.
 * If the value is already an absolute URL, it is returned as-is.
 * Safe to use in client components.
 */
export function resolveS3Url(key: string): string {
  if (key.startsWith("http")) return key;
  return `${storageBaseUrl()}/${key}`;
}
