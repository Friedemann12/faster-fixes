import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";

// Read at call time, not at module load: the GitHub integration is optional and
// missing env vars must not break the build when a route imports this module.
function getAppCredentials() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error(
      "GitHub integration is not configured: set GITHUB_APP_ID and GITHUB_PRIVATE_KEY.",
    );
  }

  return { appId, privateKey: privateKey.replace(/\\n/g, "\n") };
}

export function getAppOctokit() {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: getAppCredentials(),
  });
}

export function getInstallationOctokit(installationId: number) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: { ...getAppCredentials(), installationId },
  });
}
