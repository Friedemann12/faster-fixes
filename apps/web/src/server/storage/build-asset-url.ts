type AssetForUrl = {
  key: string;
};

/** Public URL for an asset. All providers are served through one public base URL. */
export function buildAssetUrl(asset: AssetForUrl): string {
  return `${process.env.STORAGE_PUBLIC_URL}/${asset.key}`;
}
