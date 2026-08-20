/**
 * Base URL of this instance. Set BASE_URL to the public URL in production; the
 * fallback only covers local development.
 */
export function getAppUrl(): string {
  return process.env.BASE_URL || "http://localhost:3000";
}
