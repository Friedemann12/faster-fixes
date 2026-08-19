import { presignGetObject } from "@better-upload/server/helpers";
import { getS3Client } from "@/server/storage";

type AssetForSignedUrl = {
  key: string;
  bucket: string;
};

export async function getSignedAssetUrl(
  asset: AssetForSignedUrl,
  expiresIn = 3600,
): Promise<string> {
  return presignGetObject(getS3Client(), {
    bucket: asset.bucket,
    key: asset.key,
    expiresIn,
  });
}
