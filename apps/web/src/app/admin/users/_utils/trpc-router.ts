import { router } from "@/server/trpc/trpc";
import { deleteUser } from "../[id]/_features/account/delete-user/delete-user.trpc.mutation";
import { impersonateUser } from "../[id]/_features/account/impersonate-user/impersonate-user.trpc.mutation";
import { setPassword } from "../[id]/_features/account/set-password/set-password.trpc.mutation";
import { revokeUserSessions } from "../[id]/_features/account/revoke-user-sessions/revoke-user-sessions.trpc.mutation";
import { getUserOrganizations } from "../[id]/_features/organization-select/get-user-organizations.trpc.query";
import { getUserEmail } from "../[id]/_features/user-information/email/get-user-email.trpc.query";
import { toggleEmailVerified } from "../[id]/_features/user-information/email/toggle-email-verified.trpc.mutation";
import { createUser } from "../_features/create-user/create-user.trpc.mutation";
import { getAllUsersForExport } from "../_features/users-table/get-all-users-for-export";
import { getPaginatedUsers } from "../_features/users-table/get-paginated-users";

export const usersRouter = router({
  list: getPaginatedUsers,
  export: getAllUsersForExport,
  create: createUser,
  delete: deleteUser,
  impersonate: impersonateUser,
  organizations: router({
    list: getUserOrganizations,
  }),
  sessions: router({
    revoke: revokeUserSessions,
  }),
  password: router({
    set: setPassword,
  }),
  email: router({
    get: getUserEmail,
    toggleVerified: toggleEmailVerified,
  }),
});
