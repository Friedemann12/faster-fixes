"use client";

import { useTRPC } from "@/lib/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { matchQueryStatus } from "@/utils/tanstack-query/match-query-status";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function FeedbackOverviewCard() {
  const trpc = useTRPC();
  const query = useQuery(trpc.admin.dashboard.feedback.get.queryOptions());

  return matchQueryStatus(query, {
    Loading: <FeedbackOverviewCardLoading />,
    Errored: <FeedbackOverviewCardError />,
    Success: ({ data }) => (
      <Card>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalCount}</div>
          <p className="text-muted-foreground mb-4 text-xs">Total feedback</p>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Resolved</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {data?.resolvedCount}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({data?.resolvedPercentage}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Avg per user
              </span>
              <span className="text-sm font-semibold">{data?.avgPerUser}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  });
}

function FeedbackOverviewCardLoading() {
  return (
    <Card>
      <CardContent>
        <Skeleton className="h-8 w-24" />
        <p className="text-muted-foreground mb-4 text-xs">Total feedback</p>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Resolved</span>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Avg per user</span>
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackOverviewCardError() {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <p className="text-destructive text-sm">Failed to load statistics</p>
      </CardContent>
    </Card>
  );
}
