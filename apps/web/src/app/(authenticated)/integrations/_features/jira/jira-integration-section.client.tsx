"use client";

import { useActiveOrganization } from "@/lib/auth";
import { useTRPC } from "@/lib/trpc/trpc-client";
import { matchQueryStatus } from "@/utils/tanstack-query/match-query-status";
import { useQuery } from "@tanstack/react-query";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertTriangle } from "lucide-react";
import { JiraConnected } from "./jira-connected.client";
import { JiraNotConnected } from "./jira-not-connected.client";
import { JiraSelectSite } from "./jira-select-site.client";

export function JiraIntegrationSection() {
  const trpc = useTRPC();
  const { data: activeOrg } = useActiveOrganization();

  const installationQuery = useQuery(
    trpc.authenticated.integrations.jira.getInstallation.queryOptions(
      undefined,
      { enabled: !!activeOrg?.id },
    ),
  );

  return matchQueryStatus(installationQuery, {
    Loading: <Skeleton className="h-16 w-full" />,
    Errored: (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle />
          </EmptyMedia>
          <EmptyTitle>Failed to load integration</EmptyTitle>
          <EmptyDescription>
            An error occurred while loading the Jira integration. Try refreshing
            the page.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ),
    Empty: <JiraNotConnected />,
    Success: ({ data: installation }) =>
      installation.healthState === "pending_site_selection" ? (
        <JiraSelectSite />
      ) : (
        <JiraConnected installation={installation} />
      ),
  });
}
