-- CreateTable
CREATE TABLE "jira_installation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "cloudId" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenScope" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "healthState" TEXT NOT NULL DEFAULT 'connected',
    "installedById" TEXT,

    CONSTRAINT "jira_installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jira_installation_organizationId_key" ON "jira_installation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "jira_installation_cloudId_key" ON "jira_installation"("cloudId");

-- CreateIndex
CREATE INDEX "jira_installation_organizationId_idx" ON "jira_installation"("organizationId");

-- AddForeignKey
ALTER TABLE "jira_installation" ADD CONSTRAINT "jira_installation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_installation" ADD CONSTRAINT "jira_installation_installedById_fkey" FOREIGN KEY ("installedById") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
