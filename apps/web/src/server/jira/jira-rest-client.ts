// Authenticated Jira Cloud REST calls. OAuth 3LO tokens are not bound to a site,
// so every resource call is routed through the api.atlassian.com gateway with the
// installation's cloudId in the path (ADR 0008). Kept separate from jira-client.ts,
// which only handles the auth.atlassian.com token dance.

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

type CreateMetaFieldsResponse = {
  fields: {
    fieldId: string;
    name: string;
    required: boolean;
    hasDefaultValue?: boolean;
  }[];
};

async function jiraRequest<T>(
  accessToken: string,
  cloudId: string,
  path: string,
): Promise<T> {
  const res = await fetch(`${JIRA_API_GATEWAY}/${cloudId}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira request failed (${res.status}) for ${path}: ${text}`);
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
