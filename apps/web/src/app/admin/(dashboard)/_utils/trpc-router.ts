import { router } from "@/server/trpc/trpc";
import { getFeedbackOverview } from "../_features/feedback-overview-card/get-feedback-overview.trpc.query";
import { getUsersOverview } from "../_features/users-overview-card/get-users-overview.trpc.query";

export const dashboardRouter = router({
  users: router({
    get: getUsersOverview,
  }),
  feedback: router({
    get: getFeedbackOverview,
  }),
});
