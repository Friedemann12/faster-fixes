"use client";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { ExternalLink } from "lucide-react";
import type { GetProjectJiraLinkOutput } from "./get-project-jira-link.trpc.query";
import { UnlinkJiraProjectButton } from "./unlink-project/unlink-jira-project-button.client";
import { AutoCreateIssuesSwitch } from "./update-link/auto-create-issues-switch.client";
import { DefaultLabelsEditor } from "./update-link/default-labels-editor.client";

type LinkedJiraProjectViewProps = {
  projectId: string;
  link: NonNullable<GetProjectJiraLinkOutput>;
  siteUrl: string;
};

export function LinkedJiraProjectView({
  projectId,
  link,
  siteUrl,
}: LinkedJiraProjectViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {link.linkHealthIssue && (
        <Alert>
          <AlertDescription>
            This link references a Jira project or issue type that no longer
            exists. Unlink and pick them again to clear this warning.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1">
        <a
          href={`${siteUrl.replace(/\/$/, "")}/browse/${link.jiraProjectKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          {link.jiraProjectKey} · {link.jiraProjectName}
          <ExternalLink className="ml-1 inline size-3" />
        </a>
        <p className="text-muted-foreground text-sm">
          Issue type: {link.issueTypeName}
        </p>
      </div>

      <AutoCreateIssuesSwitch
        projectId={projectId}
        checked={link.autoCreateIssues}
      />

      <DefaultLabelsEditor projectId={projectId} labels={link.defaultLabels} />

      <UnlinkJiraProjectButton projectId={projectId} />
    </div>
  );
}
