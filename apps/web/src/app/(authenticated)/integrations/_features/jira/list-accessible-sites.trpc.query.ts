"use server";

import { auth } from "@/server/auth";
import { getAccessibleResources } from "@/server/jira/jira-client";
import { getValidJiraAccessToken } from "@/server/jira/token-access";
import { protectedProcedure } from "@/server/trpc/trpc";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { headers } from "next/headers";

// Backs the multi-site picker. Reads the live accessible-resources with the
// stored token so the choice always reflects the current grant, rather than a
// snapshot taken at callback time.
export const listAccessibleJiraSites = protectedProcedure.query(
  async ({ ctx }) => {
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

    const membership = await prisma.member.findFirst({
      where: {
        organizationId: activeOrganization.id,
        userId: session.user.id,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners and admins can configure Jira.",
      });
    }

    const accessToken = await getValidJiraAccessToken(activeOrganization.id);
    const resources = await getAccessibleResources(accessToken);

    return resources.map((resource) => ({
      cloudId: resource.id,
      url: resource.url,
      name: resource.name,
    }));
  },
);

export type ListAccessibleJiraSitesOutput = inferProcedureOutput<
  typeof listAccessibleJiraSites
>;
