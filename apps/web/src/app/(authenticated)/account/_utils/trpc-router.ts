import { deleteAccount } from "@/app/(authenticated)/account/settings/_features/account-deletion/delete-account.trpc.mutation";
import { getCurrentEmail } from "@/app/(authenticated)/account/settings/_features/email/get-current-email.trpc.query";
import { changePassword } from "@/app/(authenticated)/account/settings/_features/password/change-password.trpc.mutation";
import { getProfile } from "@/app/(authenticated)/account/settings/_features/profile/get-profile.trpc.query";
import { updateAvatar } from "@/app/(authenticated)/account/settings/_features/profile/update-avatar.trpc.mutation";
import { updateProfile } from "@/app/(authenticated)/account/settings/_features/profile/update-profile.trpc.mutation";
import { router } from "@/server/trpc/trpc";

export const accountRouter = router({
  delete: deleteAccount,
  profile: router({
    get: getProfile,
    update: updateProfile,
    updateAvatar: updateAvatar,
  }),
  email: router({
    get: getCurrentEmail,
  }),
  password: router({
    change: changePassword,
  }),
});
