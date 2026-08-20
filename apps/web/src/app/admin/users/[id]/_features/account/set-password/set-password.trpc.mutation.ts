import { auth } from "@/server/auth";
import { adminProcedure } from "@/server/trpc/trpc";
import { TRPCError, inferProcedureOutput } from "@trpc/server";
import { prisma } from "@workspace/db";
import { headers } from "next/headers";
import { SetPasswordSchema } from "./set-password.schema";

// Replaces the former "send a reset link" action: with no mail channel, the
// operator sets the password directly and passes it on out of band.
export const setPassword = adminProcedure
  .input(SetPasswordSchema)
  .mutation(async ({ input }) => {
    const { userId, newPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accounts: { select: { providerId: true } } },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const hasCredentialProvider = user.accounts.some(
      (account) => account.providerId === "credential",
    );

    if (!hasCredentialProvider) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User does not have a credential-based account",
      });
    }

    await auth.api.setUserPassword({
      body: { userId, newPassword },
      headers: await headers(),
    });

    return { success: true };
  });

export type SetPasswordOutput = inferProcedureOutput<typeof setPassword>;
