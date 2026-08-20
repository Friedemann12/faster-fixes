type AssetForUrl = {
  key: string;
};

/** URL of an asset, served through the app's asset route. */
export function buildAssetUrl(asset: AssetForUrl): string {
  return `/api/assets/${asset.key}`;
}
