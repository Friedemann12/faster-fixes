import { getS3Client } from "@/server/storage";
import { presignGetObject } from "@better-upload/server/helpers";

type RouteParams = { params: Promise<{ key: string[] }> };

/**
 * Streams a stored object through the app.
 *
 * The alternative — exposing MinIO on its own public domain and handing out
 * presigned URLs — needs a second domain, its own certificate and a CORS
 * origin, and it broke repeatedly on Coolify's proxy configuration. Serving
 * through the app keeps the bucket unreachable from outside entirely.
 *
 * Unauthenticated on purpose: screenshot URLs are embedded in GitHub and Linear
 * issues, which fetch them without a session. Object keys are random, which is
 * the same protection the presigned-URL variant offered in practice.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { key } = await params;

  // Signed against the internal endpoint and consumed here on the server, so
  // the container hostname in the URL never reaches a browser.
  const url = await presignGetObject(getS3Client(), {
    bucket: process.env.STORAGE_BUCKET_NAME!,
    key: key.join("/"),
    expiresIn: 60,
  });

  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
