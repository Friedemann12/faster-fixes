import { router } from "@/server/trpc/trpc";
import { stopImpersonate } from "../stop-impersonate-button/stop-impersonate.trpc.mutation";

export const authenticationFeatureRouter = router({
  stopImpersonate: stopImpersonate,
});
