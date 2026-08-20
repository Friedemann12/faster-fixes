"use server";

import { protectedProcedure } from "@/server/trpc/trpc";
import { inferProcedureOutput } from "@trpc/server";

export const getReceivedInvitations = protectedProcedure.query(
  async ({ ctx }) => {
    const { prisma, session } = ctx;

    const invitations = await prisma.invitation.findMany({
      where: {
        // Better Auth lowercases invitation emails on create, so a mixed-case
        // sign-up address would otherwise never match its own invitation.
        email: session.user.email.toLowerCase(),
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invitations;
  },
);

export type GetReceivedInvitationsOutput = inferProcedureOutput<
  typeof getReceivedInvitations
>;
