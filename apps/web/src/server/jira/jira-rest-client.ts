// Authenticated Jira Cloud REST calls. OAuth 3LO tokens are not bound to a site,
// so every resource call is routed through the api.atlassian.com gateway with the
// installation's cloudId in the path (ADR 0008). Kept separate from jira-client.ts,
// which only handles the auth.atlassian.com token dance.

import type { AdfDocument } from "./format-issue-adf";

const JIRA_API_GATEWAY = "https://api.atlassian.com/ex/jira";

// Fields Faster Fixes populates when mirroring a Feedback. A required field
// outside this set cannot be filled from Feedback data, so the link is blocked
// rather than allowed to fail at issue-creation time.
const FULFILLABLE_FIELD_IDS = new Set([
  "project",
  "issuetype",
  "summary",
  "description",
]);

// Jira caps project/search at 50 per page; loop rather than truncate so sites
// with many projects still show all of them in the picker.
const PROJECT_PAGE_SIZE = 50;

export type JiraProjectSummary = {
  id: string;
  key: string;
  name: string;
};

export type JiraIssueTypeSummary = {
  id: string;
  name: string;
  description: string | null;
};

type ProjectSearchResponse = {
  values: { id: string; key: string; name: string }[];
  isLast: boolean;
};

type CreateMetaIssueTypesResponse = {
  issueTypes: {
    id: string;
    name: string;
    description?: string;
    // Sub-tasks require a parent issue, which Feedback mirroring has no notion of.
    subtask?: boolean;
  }[];
};

type CreateIssueResponse = {
  id: string;
  key: string;
};

type IssueStatusResponse = {
  // Jira's coarse categories: "new" | "indeterminate" | "done".
  fields: { status: { statusCategory: { key: string } } };
};

type CreateMetaFieldsResponse = {
  fields: {
    fieldId: string;
    name: string;
    required: boolean;
    hasDefaultValue?: boolean;
  }[];
};

/**
 * Jira rejected the create payload itself — a required field appeared after the
 * link was made, or the issue type / project no longer accepts it. Retrying the
 * same payload can never succeed, so callers surface this as link ill-health
 * instead of burning the retry budget.
 */
export class JiraIssueConfigurationError extends Error {
  constructor(
    // Matches the ProjectJiraLink.linkHealthIssue vocabulary so callers can
    // store it verbatim.
    readonly reason: "stale_issue_type" | "stale_project",
    readonly detail: string,
  ) {
    super(`Jira rejected the issue payload (${reason}): ${detail}`);
    this.name = "JiraIssueConfigurationError";
  }
}

class JiraRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    path: string,
  ) {
    super(`Jira request failed (${status}) for ${path}: ${body}`);
    this.name = "JiraRequestError";
  }
}

async function jiraRequest<T>(
  accessToken: string,
  cloudId: string,
  path: string,
  init?: { method: "POST"; body: unknown },
): Promise<T> {
  const res = await fetch(`${JIRA_API_GATEWAY}/${cloudId}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init ? { "Content-Type": "application/json" } : {}),
    },
    ...(init ? { body: JSON.stringify(init.body) } : {}),
  });

  if (!res.ok) {
    throw new JiraRequestError(res.status, await res.text(), path);
  }

  return (await res.json()) as T;
}

export async function listJiraProjects(
  accessToken: string,
  cloudId: string,
): Promise<JiraProjectSummary[]> {
  const projects: JiraProjectSummary[] = [];
  let startAt = 0;

  for (;;) {
    const page = await jiraRequest<ProjectSearchResponse>(
      accessToken,
      cloudId,
      `/rest/api/3/project/search?startAt=${startAt}&maxResults=${PROJECT_PAGE_SIZE}&orderBy=name`,
    );

    projects.push(
      ...page.values.map((p) => ({ id: p.id, key: p.key, name: p.name })),
    );

    if (page.isLast || page.values.length === 0) break;
    startAt += page.values.length;
  }

  return projects;
}

export async function listJiraIssueTypes(
  accessToken: string,
  cloudId: string,
  jiraProjectIdOrKey: string,
): Promise<JiraIssueTypeSummary[]> {
  const data = await jiraRequest<CreateMetaIssueTypesResponse>(
    accessToken,
    cloudId,
    `/rest/api/3/issue/createmeta/${encodeURIComponent(jiraProjectIdOrKey)}/issuetypes`,
  );

  return data.issueTypes
    .filter((type) => !type.subtask)
    .map((type) => ({
      id: type.id,
      name: type.name,
      description: type.description ?? null,
    }));
}

/**
 * Returns the names of required fields that Faster Fixes cannot populate for the
 * given Jira project + issue type. A required field with a default value is
 * fulfillable — Jira fills it itself — so it is not reported.
 */
export async function findUnfulfillableRequiredFields(
  accessToken: string,
  cloudId: string,
  jiraProjectIdOrKey: string,
  issueTypeId: string,
): Promise<string[]> {
  const data = await jiraRequest<CreateMetaFieldsResponse>(
    accessToken,
    cloudId,
    `/rest/api/3/issue/createmeta/${encodeURIComponent(jiraProjectIdOrKey)}/issuetypes/${encodeURIComponent(issueTypeId)}`,
  );

  return data.fields
    .filter(
      (field) =>
        field.required &&
        !field.hasDefaultValue &&
        !FULFILLABLE_FIELD_IDS.has(field.fieldId),
    )
    .map((field) => field.name);
}

/**
 * Creates an issue and returns it with its resolved status category. The create
 * response carries only id/key/self, so the status is read back in a second call
 * — the category is what the status-sync slice maps on, and guessing "new" would
 * be wrong for workflows whose initial status sits in another category.
 */
export async function createJiraIssue(
  accessToken: string,
  cloudId: string,
  input: {
    jiraProjectId: string;
    issueTypeId: string;
    summary: string;
    description: AdfDocument;
    labels: string[];
  },
): Promise<{ id: string; key: string; statusCategory: string }> {
  let created: CreateIssueResponse;
  try {
    created = await jiraRequest<CreateIssueResponse>(
      accessToken,
      cloudId,
      "/rest/api/3/issue",
      {
        method: "POST",
        body: {
          fields: {
            project: { id: input.jiraProjectId },
            issuetype: { id: input.issueTypeId },
            summary: input.summary,
            description: input.description,
            ...(input.labels.length > 0 ? { labels: input.labels } : {}),
          },
        },
      },
    );
  } catch (error) {
    // 400 = payload rejected (a required field appeared, or the issue type no
    // longer accepts it). 404 = the Jira project itself is gone or no longer
    // visible to this grant. Both are link configuration drift, not transient.
    if (error instanceof JiraRequestError) {
      if (error.status === 404) {
        throw new JiraIssueConfigurationError("stale_project", error.body);
      }
      if (error.status === 400) {
        throw new JiraIssueConfigurationError("stale_issue_type", error.body);
      }
    }
    throw error;
  }

  const detail = await jiraRequest<IssueStatusResponse>(
    accessToken,
    cloudId,
    `/rest/api/3/issue/${encodeURIComponent(created.id)}?fields=status`,
  );

  return {
    id: created.id,
    key: created.key,
    statusCategory: detail.fields.status.statusCategory.key,
  };
}
