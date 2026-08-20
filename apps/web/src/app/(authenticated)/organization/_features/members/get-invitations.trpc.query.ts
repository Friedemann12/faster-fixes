"use server";

import { buildInviteUrl } from "@/app/_features/organization/_utils/build-invite-url";
import { protectedProcedure } from "@/server/trpc/trpc";
import { inferProcedureOutput, TRPCError } from "@trpc/server";
import { GetInvitationsSchema } from "./get-invitations.schema";

export const getInvitations = protectedProcedure
  .input(GetInvitationsSchema)
  .query(async ({ input, ctx }) => {
    const { prisma, session } = ctx;

    const membership = await prisma.member.findFirst({
      where: {
        organizationId: input.organizationId,
        userId: session.user.id,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You do not have permission to view invitations.",
      });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId: input.organizationId,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    return invitations.map((invitation) => ({
      ...invitation,
      inviteUrl: buildInviteUrl(invitation.id),
      // Expired rows keep status "pending", so without this the table would
      // offer links that no longer work.
      isExpired: invitation.expiresAt < now,
    }));
  });

export type GetInvitationsOutput = inferProcedureOutput<
  typeof getInvitations
>;
