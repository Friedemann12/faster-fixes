import { TRPCError } from "@trpc/server";

// @workspace/db exports only the configured `prisma` instance, not the
// PrismaClient class, so the client type is derived from it.
type PrismaClient = (typeof import("@workspace/db"))["prisma"];

type RequireJiraAccessArgs = {
  prisma: PrismaClient;
  userId: string;
  projectId: string;
  // Reads (pickers, current link) allow any member; writes are owner/admin only.
  requireAdmin: boolean;
  adminDeniedMessage?: string;
};

/**
 * Resolves the organization owning the project, checks the caller's membership,
 * and returns the org's Jira installation. Every project-scoped Jira procedure
 * needs this same three-step preamble, and getting the org from the project (not
 * from the caller's active membership) is what keeps a user in several orgs from
 * reading another org's Jira site.
 */
export async function requireJiraAccess({
  prisma,
  userId,
  projectId,
  requireAdmin,
  adminDeniedMessage,
}: RequireJiraAccessArgs) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });

  if (!project) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
  }

  const membership = await prisma.member.findFirst({
    where: {
      organizationId: project.organizationId,
      userId,
      ...(requireAdmin ? { role: { in: ["owner", "admin"] } } : {}),
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: adminDeniedMessage ?? "Access denied.",
    });
  }

  const installation = await prisma.jiraInstallation.findUnique({
    where: { organizationId: project.organizationId },
    select: { id: true, cloudId: true, siteUrl: true, healthState: true },
  });

  if (!installation) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Jira is not connected. Connect a Jira site first.",
    });
  }

  if (installation.healthState === "reconnect_required") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "The Jira connection needs to be re-authorized.",
    });
  }

  return { organizationId: project.organizationId, installation };
}
