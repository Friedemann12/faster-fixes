-- CreateTable
CREATE TABLE "feedback_jira_issue_link" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "projectJiraLinkId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "issueKey" TEXT NOT NULL,
    "issueUrl" TEXT NOT NULL,
    "issueStatusCategory" TEXT NOT NULL,
    "lastSyncSource" TEXT,
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "feedback_jira_issue_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_jira_issue_link_feedbackId_key" ON "feedback_jira_issue_link"("feedbackId");

-- CreateIndex
CREATE INDEX "feedback_jira_issue_link_projectJiraLinkId_idx" ON "feedback_jira_issue_link"("projectJiraLinkId");

-- CreateIndex
CREATE INDEX "feedback_jira_issue_link_issueId_idx" ON "feedback_jira_issue_link"("issueId");

-- AddForeignKey
ALTER TABLE "feedback_jira_issue_link" ADD CONSTRAINT "feedback_jira_issue_link_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_jira_issue_link" ADD CONSTRAINT "feedback_jira_issue_link_projectJiraLinkId_fkey" FOREIGN KEY ("projectJiraLinkId") REFERENCES "project_jira_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
