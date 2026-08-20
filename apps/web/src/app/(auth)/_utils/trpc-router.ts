import { loginMutation } from "@/app/(auth)/login/_features/login-form/login.trpc.mutation";
import { signupMutation } from "@/app/(auth)/signup/_features/signup-form/signup.trpc.mutation";
import { router } from "@/server/trpc/trpc";

export const authRouter = router({
  login: loginMutation,
  signup: signupMutation,
});
