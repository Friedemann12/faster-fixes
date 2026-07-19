"use server";

import { listJiraProjects } from "@/server/jira/jira-rest-client";
import { getValidJiraAccessToken } from "@/server/jira/token-access";
import { protectedProcedure } from "@/server/trpc/trpc";
import { inferProcedureOutput } from "@trpc/server";
import { z } from "zod";
import { requireJiraAccess } from "../_utils/require-jira-access";

export const listAccessibleJiraProjects = protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { prisma, session } = ctx;

    const { organizationId, installation } = await requireJiraAccess({
      prisma,
      userId: session.user.id,
      projectId: input.projectId,
      requireAdmin: false,
    });

    const accessToken = await getValidJiraAccessToken(organizationId);
    return listJiraProjects(accessToken, installation.cloudId);
  });

export type ListAccessibleJiraProjectsOutput = inferProcedureOutput<
  typeof listAccessibleJiraProjects
>;
