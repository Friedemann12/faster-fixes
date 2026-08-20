import { organization } from "better-auth/plugins";

export const organizationPlugin = organization({
  // Two weeks instead of the 48h default: invitation links are forwarded by
  // hand here, not delivered by mail, so they need to survive a weekend.
  invitationExpiresIn: 60 * 60 * 24 * 14,

  schema: {
    organization: {
      additionalFields: {
        isDefault: {
          type: "boolean",
          required: true,
          defaultValue: false,
        },
      },
    },
  },
});
