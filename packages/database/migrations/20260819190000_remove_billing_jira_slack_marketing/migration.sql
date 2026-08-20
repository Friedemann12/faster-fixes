
-- DropForeignKey
ALTER TABLE "jira_installation" DROP CONSTRAINT "jira_installation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "jira_installation" DROP CONSTRAINT "jira_installation_installedById_fkey";

-- DropForeignKey
ALTER TABLE "project_jira_link" DROP CONSTRAINT "project_jira_link_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_jira_link" DROP CONSTRAINT "project_jira_link_jiraInstallationId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_jira_issue_link" DROP CONSTRAINT "feedback_jira_issue_link_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_jira_issue_link" DROP CONSTRAINT "feedback_jira_issue_link_projectJiraLinkId_fkey";

-- DropForeignKey
ALTER TABLE "slack_installation" DROP CONSTRAINT "slack_installation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "slack_installation" DROP CONSTRAINT "slack_installation_installedById_fkey";

-- DropForeignKey
ALTER TABLE "project_slack_link" DROP CONSTRAINT "project_slack_link_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_slack_link" DROP CONSTRAINT "project_slack_link_slackInstallationId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_slack_message" DROP CONSTRAINT "feedback_slack_message_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_slack_message" DROP CONSTRAINT "feedback_slack_message_projectSlackLinkId_fkey";

-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "marketing_preferences" DROP CONSTRAINT "marketing_preferences_userId_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "stripeCustomerId";

-- DropTable
DROP TABLE "jira_installation";

-- DropTable
DROP TABLE "project_jira_link";

-- DropTable
DROP TABLE "feedback_jira_issue_link";

-- DropTable
DROP TABLE "slack_installation";

-- DropTable
DROP TABLE "project_slack_link";

-- DropTable
DROP TABLE "feedback_slack_message";

-- DropTable
DROP TABLE "subscription";

-- DropTable
DROP TABLE "marketing_preferences";

