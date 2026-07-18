-- CreateTable
CREATE TABLE "project_jira_link" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "jiraInstallationId" TEXT NOT NULL,
    "jiraProjectId" TEXT NOT NULL,
    "jiraProjectKey" TEXT NOT NULL,
    "jiraProjectName" TEXT NOT NULL,
    "issueTypeId" TEXT NOT NULL,
    "issueTypeName" TEXT NOT NULL,
    "autoCreateIssues" BOOLEAN NOT NULL DEFAULT true,
    "defaultLabels" TEXT[] DEFAULT ARRAY['faster-fixes']::TEXT[],
    "webhookRegistrationId" TEXT,
    "webhookExpiresAt" TIMESTAMP(3),
    "linkHealthIssue" TEXT,

    CONSTRAINT "project_jira_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_jira_link_projectId_key" ON "project_jira_link"("projectId");

-- CreateIndex
CREATE INDEX "project_jira_link_jiraInstallationId_idx" ON "project_jira_link"("jiraInstallationId");

-- CreateIndex
CREATE INDEX "project_jira_link_jiraProjectId_idx" ON "project_jira_link"("jiraProjectId");

-- AddForeignKey
ALTER TABLE "project_jira_link" ADD CONSTRAINT "project_jira_link_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_jira_link" ADD CONSTRAINT "project_jira_link_jiraInstallationId_fkey" FOREIGN KEY ("jiraInstallationId") REFERENCES "jira_installation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
