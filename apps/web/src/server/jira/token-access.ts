import { prisma } from "@workspace/db";
import { decryptToken, encryptToken } from "./crypto";
import { refreshAccessToken } from "./jira-client";

// Refresh slightly before the real expiry so a token isn't handed out moments
// before it dies mid-request.
const EXPIRY_SKEW_MS = 60_000;

export class JiraNotConnectedError extends Error {
  constructor() {
    super("No Jira installation for this organization.");
    this.name = "JiraNotConnectedError";
  }
}

// Thrown when the refresh token no longer works (revoked user access). The
// installation is flipped to `reconnect_required` so the UI can prompt a
// re-authorization instead of failing silently (ADR 0008).
export class JiraReauthRequiredError extends Error {
  constructor() {
    super("Jira installation requires re-authorization.");
    this.name = "JiraReauthRequiredError";
  }
}

type LockedRow = {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};

function isFresh(expiresAt: Date | null): boolean {
  return !!expiresAt && expiresAt.getTime() - EXPIRY_SKEW_MS > Date.now();
}

/**
 * Returns a valid (decrypted) Jira access token for the organization, refreshing
 * lazily when the current one is expired.
 *
 * Atlassian rotates the refresh token on every refresh and invalidates the old
 * one, so two concurrent refreshes racing on the same installation would leave
 * one holding a dead refresh token — bricking the connection. The refresh path
 * therefore runs inside a transaction that takes a `FOR UPDATE` row lock and
 * re-checks expiry after acquiring it (double-check): the loser of the race sees
 * the token the winner just wrote and returns it instead of refreshing again.
 */
export async function getValidJiraAccessToken(
  organizationId: string,
): Promise<string> {
  const installation = await prisma.jiraInstallation.findUnique({
    where: { organizationId },
    select: { accessToken: true, tokenExpiresAt: true },
  });

  if (!installation) throw new JiraNotConnectedError();

  // Fast path: still valid, no lock needed.
  if (isFresh(installation.tokenExpiresAt)) {
    return decryptToken(installation.accessToken);
  }

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<LockedRow[]>`
      SELECT "id", "accessToken", "refreshToken", "tokenExpiresAt"
      FROM "jira_installation"
      WHERE "organizationId" = ${organizationId}
      FOR UPDATE
    `;
    const row = rows[0];
    if (!row) throw new JiraNotConnectedError();

    // Another request refreshed while we waited for the lock.
    if (isFresh(row.tokenExpiresAt)) {
      return decryptToken(row.accessToken);
    }

    if (!row.refreshToken) {
      await tx.jiraInstallation.update({
        where: { id: row.id },
        data: { healthState: "reconnect_required" },
      });
      throw new JiraReauthRequiredError();
    }

    let refreshed;
    try {
      refreshed = await refreshAccessToken(decryptToken(row.refreshToken));
    } catch {
      await tx.jiraInstallation.update({
        where: { id: row.id },
        data: { healthState: "reconnect_required" },
      });
      throw new JiraReauthRequiredError();
    }

    await tx.jiraInstallation.update({
      where: { id: row.id },
      data: {
        accessToken: encryptToken(refreshed.access_token),
        // Persist the rotated refresh token atomically; fall back to the existing
        // one only if Atlassian omitted it (should not happen with offline_access).
        refreshToken: refreshed.refresh_token
          ? encryptToken(refreshed.refresh_token)
          : row.refreshToken,
        tokenScope: refreshed.scope,
        tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        healthState: "connected",
      },
    });

    return refreshed.access_token;
  });
}
