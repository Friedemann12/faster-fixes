"use server";

import { findUnfulfillableRequiredFields } from "@/server/jira/jira-rest-client";
import { getValidJiraAccessToken } from "@/server/jira/token-access";
import { registerProjectJiraWebhook } from "@/server/jira/webhook-registration";
import { enforceFeature } from "@/server/trpc/middlewares/enforce-feature";
import { planAwareProcedure } from "@/server/trpc/middlewares/with-plan-context";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { requireJiraAccess } from "../_utils/require-jira-access";
import { LinkJiraProjectSchema } from "./link-jira-project.schema";

export const linkJiraProject = planAwareProcedure
  .use(enforceFeature("jiraIntegration"))
  .input(LinkJiraProjectSchema)
  .mutation(async ({ input, ctx }) => {
    const { prisma, session } = ctx;

    const { organizationId, installation } = await requireJiraAccess({
      prisma,
      userId: session.user.id,
      projectId: input.projectId,
      requireAdmin: true,
      adminDeniedMessage: "Only owners and admins can link Jira projects.",
    });

    // Checked at link time rather than at issue creation: a required custom field
    // we cannot populate would otherwise turn every mirrored Feedback into a
    // silent 400 from Jira, long after the maintainer left this screen.
    const accessToken = await getValidJiraAccessToken(organizationId);
    const blockingFields = await findUnfulfillableRequiredFields(
      accessToken,
      installation.cloudId,
      input.jiraProjectId,
      input.issueTypeId,
    );

    if (blockingFields.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `This issue type requires fields Faster Fixes cannot fill: ${blockingFields.join(", ")}. Make them optional in Jira, or choose another issue type.`,
      });
    }

    const link = await prisma.projectJiraLink.upsert({
      where: { projectId: input.projectId },
      update: {
        jiraInstallationId: installation.id,
        jiraProjectId: input.jiraProjectId,
        jiraProjectKey: input.jiraProjectKey,
        jiraProjectName: input.jiraProjectName,
        issueTypeId: input.issueTypeId,
        issueTypeName: input.issueTypeName,
        autoCreateIssues: input.autoCreateIssues,
        defaultLabels: input.defaultLabels,
        linkHealthIssue: null,
      },
      create: {
        projectId: input.projectId,
        jiraInstallationId: installation.id,
        jiraProjectId: input.jiraProjectId,
        jiraProjectKey: input.jiraProjectKey,
        jiraProjectName: input.jiraProjectName,
        issueTypeId: input.issueTypeId,
        issueTypeName: input.issueTypeName,
        autoCreateIssues: input.autoCreateIssues,
        defaultLabels: input.defaultLabels,
      },
    });

    // Inbound status sync is an enhancement, not a precondition for linking: a
    // registration failure (Jira permissions, unreachable callback URL) still
    // leaves outbound mirroring fully working, and the health cron retries.
    try {
      await registerProjectJiraWebhook(link.id);
    } catch (error) {
      console.error(
        `[jira] webhook registration failed for project link ${link.id}`,
        error,
      );
    }

    return { id: link.id };
  });

export type LinkJiraProjectOutput = inferProcedureOutput<
  typeof linkJiraProject
>;
