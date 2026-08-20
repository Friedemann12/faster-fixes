type AssetForSignedUrl = {
  key: string;
};

/**
 * Absolute URL of a stored asset, served through the app's asset route.
 *
 * Absolute rather than relative because these URLs are embedded in GitHub and
 * Linear issues, which fetch them from outside the app.
 */
export async function getSignedAssetUrl(
  asset: AssetForSignedUrl,
): Promise<string> {
  return `${process.env.BASE_URL ?? ""}/api/assets/${asset.key}`;
}
