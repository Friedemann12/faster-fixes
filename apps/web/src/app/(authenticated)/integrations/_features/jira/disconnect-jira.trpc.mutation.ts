"use server";

import { auth } from "@/server/auth";
import { protectedProcedure } from "@/server/trpc/trpc";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { headers } from "next/headers";

export const disconnectJira = protectedProcedure.mutation(async ({ ctx }) => {
  const { prisma, session } = ctx;

  const activeOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  if (!activeOrganization) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization.",
    });
  }

  // Owner-only per ADR 0008: disconnecting drops the org's only Jira link, a
  // heavier action than installing (which admins may also do).
  const membership = await prisma.member.findFirst({
    where: {
      organizationId: activeOrganization.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the organization owner can disconnect Jira.",
    });
  }

  // Atlassian has no public 3LO token-revocation endpoint; the user revokes
  // access from their Atlassian account's connected apps. We drop the local
  // installation, which stops all further token use.
  await prisma.jiraInstallation.deleteMany({
    where: { organizationId: activeOrganization.id },
  });

  return { success: true };
});

export type DisconnectJiraOutput = inferProcedureOutput<typeof disconnectJira>;
