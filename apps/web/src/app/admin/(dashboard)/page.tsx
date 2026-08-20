import { DashboardPageContent } from "@/app/_features/core/dashboard/dashboard-page-content";
import { FeedbackOverviewCard } from "./_features/feedback-overview-card/feedback-overview-card.client";
import { UsersOverviewCard } from "./_features/users-overview-card/users-overview-card.client";

export default async function AdminDashboardPage() {
  return (
    <DashboardPageContent
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard", link: "/admin" }]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <UsersOverviewCard />
          <FeedbackOverviewCard />
        </div>
      </div>
    </DashboardPageContent>
  );
}
