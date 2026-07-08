# Jira Cloud uses OAuth 2.0 (3LO) user-bound tokens

The Jira integration targets Jira Cloud only and authorizes via Atlassian OAuth 2.0
(3LO). Unlike Linear (ADR 0002), the token is bound to the human who authorized the
connection — Atlassian offers no `actor=app` equivalent for 3LO. Issues created by
Faster Fixes are attributed to that user, and the token dies if their Jira access is
revoked. This is a deliberate deviation from the principle established in ADR 0002.

## Why

The app-identity alternative is an Atlassian Connect app: stable app-scoped
credentials, lifecycle independent of any user, descriptor-declared webhooks with no
expiry. It was rejected because it requires a Marketplace listing (review process
measured in weeks), lifecycle endpoints, and an architecture that shares almost
nothing with the Linear integration we otherwise mirror. 3LO maps nearly one-to-one
onto the existing Linear pattern: OAuth install/callback routes, encrypted token
storage (ADR 0003), lazy refresh, and an `oauth-revoked` Inngest handler.

The installer-leaves failure mode is mitigated rather than eliminated:

- The connect UI recommends authorizing with a service account.
- Revocation (401 after refresh failure) flips the installation into an unhealthy
  "reconnect required" state and notifies the organization, instead of failing
  silently.

## Consequences

- Jira Server / Data Center is out of scope; supporting it later is a separate
  integration, not a config option.
- Atlassian uses **rotating refresh tokens**: every refresh returns a new refresh
  token and invalidates the old one. Refresh must persist the new token atomically,
  and concurrent refreshes must be serialized (single-flight/lock), or a lost
  rotation bricks the installation.
- Jira-side audit logs and issue attribution show the authorizing user, not
  "Faster Fixes". Customers expecting app attribution must be pointed at the
  service-account recommendation.
- Moving to app-level identity later means building a Connect (or Forge) app and
  re-connecting every existing installation.
