"use server";

import { protectedProcedure } from "@/server/trpc/trpc";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { z } from "zod";

export const getProjectJiraLink = protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ input, ctx }) => {
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
      },
    });

    if (!membership) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
    }

    const link = await prisma.projectJiraLink.findUnique({
      where: { projectId: input.projectId },
      select: {
        id: true,
        jiraProjectId: true,
        jiraProjectKey: true,
        jiraProjectName: true,
        issueTypeId: true,
        issueTypeName: true,
        autoCreateIssues: true,
        defaultLabels: true,
        linkHealthIssue: true,
      },
    });

    return link;
  });

export type GetProjectJiraLinkOutput = inferProcedureOutput<
  typeof getProjectJiraLink
>;
