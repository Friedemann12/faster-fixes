import { prisma } from "@workspace/db";
import { APIError } from "better-auth/api";

/**
 * Sign-up is invite-only. An email may register when it holds a pending
 * invitation, when it is on the bootstrap allowlist, or when the instance has no
 * users at all — the first account has nobody to be invited by.
 *
 * Enforced in the database hook rather than on the sign-up endpoint, so it also
 * covers any other path that creates a user.
 */
export async function assertSignUpAllowed(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();

  const invitation = await prisma.invitation.findFirst({
    where: {
      email: normalized,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (invitation) return;

  const allowlist = (process.env.SIGNUP_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.toLowerCase().trim())
    .filter(Boolean);

  if (allowlist.includes(normalized)) return;

  if ((await prisma.user.count()) === 0) return;

  throw new APIError("FORBIDDEN", {
    message:
      "This instance is invite-only. Ask an administrator for an invitation link.",
  });
}
