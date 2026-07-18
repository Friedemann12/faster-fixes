"use server";

import { deregisterProjectJiraWebhook } from "@/server/jira/webhook-registration";
import { protectedProcedure } from "@/server/trpc/trpc";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { z } from "zod";

// Not plan-gated: downgraded users must always be able to unlink. Deliberately
// does not use requireJiraAccess — unlinking must stay possible even when the
// org-level installation is gone or needs re-authorization.
export const unlinkJiraProject = protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { prisma, session } = ctx;

    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: { organizationId: true },
    });

    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
    }

    const membership = await prisma.member.findFirst({
      where: {
        organizationId: project.organizationId,
        userId: session.user.id,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners and admins can unlink Jira projects.",
      });
    }

    const link = await prisma.projectJiraLink.findUnique({
      where: { projectId: input.projectId },
      include: { jiraInstallation: true },
    });

    if (link) {
      await deregisterProjectJiraWebhook(link);
    }

    await prisma.projectJiraLink.deleteMany({
      where: { projectId: input.projectId },
    });

    return { success: true };
  });

export type UnlinkJiraProjectOutput = inferProcedureOutput<
  typeof unlinkJiraProject
>;
