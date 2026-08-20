"use server";

import { buildInviteUrl } from "@/app/_features/organization/_utils/build-invite-url";
import { auth } from "@/server/auth";
import { inferProcedureOutput, TRPCError } from "@trpc/server";
import { CreateInvitationSchema } from "./create-invitation.schema";
import { protectedProcedure } from "@/server/trpc/trpc";

export const createInvitation = protectedProcedure
  .input(CreateInvitationSchema)
  .mutation(async ({ input, ctx }) => {
    const { prisma, session, headers } = ctx;

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
          "You do not have permission to invite members.",
      });
    }

    try {
      const invitation = await auth.api.createInvitation({
        body: {
          email: input.email,
          role: input.role,
          organizationId: input.organizationId,
        },
        headers,
      });

      // The link is what the operator actually needs: this instance sends no
      // invitation mail, so it is copied and forwarded by hand.
      return {
        ...invitation,
        inviteUrl: buildInviteUrl(invitation.id),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error sending invitation.",
      });
    }
  });

export type CreateInvitationOutput = inferProcedureOutput<
  typeof createInvitation
>;
