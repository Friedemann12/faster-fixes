"use server";

import { enforceFeature } from "@/server/trpc/middlewares/enforce-feature";
import { planAwareProcedure } from "@/server/trpc/middlewares/with-plan-context";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { requireJiraAccess } from "../_utils/require-jira-access";
import { UpdateProjectJiraLinkSchema } from "./update-project-jira-link.schema";

export const updateProjectJiraLink = planAwareProcedure
  .use(enforceFeature("jiraIntegration"))
  .input(UpdateProjectJiraLinkSchema)
  .mutation(async ({ input, ctx }) => {
    const { prisma, session } = ctx;

    await requireJiraAccess({
      prisma,
      userId: session.user.id,
      projectId: input.projectId,
      requireAdmin: true,
      adminDeniedMessage:
        "Only owners and admins can change Jira link settings.",
    });

    const link = await prisma.projectJiraLink.findUnique({
      where: { projectId: input.projectId },
      select: { id: true },
    });

    if (!link) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "This project is not linked to a Jira project.",
      });
    }

    await prisma.projectJiraLink.update({
      where: { id: link.id },
      data: {
        ...(input.autoCreateIssues !== undefined && {
          autoCreateIssues: input.autoCreateIssues,
        }),
        ...(input.defaultLabels !== undefined && {
          defaultLabels: input.defaultLabels,
        }),
      },
    });

    return { success: true };
  });

export type UpdateProjectJiraLinkOutput = inferProcedureOutput<
  typeof updateProjectJiraLink
>;
