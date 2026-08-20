import { minio } from "@better-upload/server/clients";

let client: ReturnType<typeof minio> | undefined;

function createClient(endpoint: string) {
  return minio({
    endpoint,
    region: process.env.STORAGE_REGION || "us-east-1",
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  });
}

/**
 * The only storage client. MinIO is reached over the internal network and has
 * no public endpoint; assets are served to browsers through /api/assets.
 * Lazy + memoized: env is only read on the server at request time, never at
 * build time.
 */
export function getS3Client() {
  client ??= createClient(process.env.STORAGE_ENDPOINT!);
  return client;
}
