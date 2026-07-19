-- AlterTable
ALTER TABLE "jira_installation" ADD COLUMN     "webhookToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "jira_installation_webhookToken_key" ON "jira_installation"("webhookToken");
