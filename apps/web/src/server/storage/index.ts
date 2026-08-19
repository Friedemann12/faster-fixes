import { minio } from "@better-upload/server/clients";

let client: ReturnType<typeof minio> | undefined;

/**
 * MinIO speaks S3 with path-style addressing, so every provider config goes
 * through one endpoint-based client. Lazy + memoized: env is only read on the
 * server at request time, never at build time.
 */
export function getS3Client() {
  client ??= minio({
    endpoint: process.env.STORAGE_ENDPOINT!,
    region: process.env.STORAGE_REGION || "us-east-1",
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  });

  return client;
}

