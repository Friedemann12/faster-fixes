# agent.md

## Non-negotiables

- You are FORBIDDEN from deleting any files yourself.
- If a file must be retired by you: keep an empty `_deprecated_*.ts(x)` replacement with a short comment.
- The user MAY delete files. If a file is already deleted (shows as `deleted` in git status), do NOT restore it — include the deletion as-is in the commit.
- Never edit `.env`, `.env.local`, or any `.env*` file.
- If env vars change, update `.env.example` only.
- Never run production database migrations (`bun run migrate:prod`).
- Only run development migrations (`bun run migrate:dev`); production migration execution is user-managed.
- Code identifiers, comments, filenames, schemas: English only.
- User-facing UI copy: English only. Professional, clear, and concise — match the tone of serious developer tools (e.g., Vercel, Linear, Stripe). No marketing fluff, no casual language, no exclamation marks. Prefer precise, understated wording.
- All `unstable_cache` usage must include `cacheTags` from `@/server/cache/cache-tags`.

## Code comments

- Comments exist to capture **decisions**, not describe code. A dev returning in 6 months should understand _why_ the code is this way, not _what_ it does.
- Comment when: choosing one approach over an obvious alternative, working around a limitation, relying on non-obvious behavior, or enforcing a subtle business rule.
- Never comment what the code plainly says (e.g. no `// get user` above `getUser()`).
- Prefer a short inline `// why` over a multi-line block above a function.

## Critical conventions

- Naming:
- `*.client.tsx` for client components.
- `*.server.tsx` for server components.
- `*.trpc.query.ts` for tRPC queries.
- `*.trpc.mutation.ts` for tRPC mutations.
- `*.schema.ts` for Zod schemas.
- When a form is used for both create and edit: split into a dialog wrapper (fetches data, `matchQueryStatus`) and a pure form component (receives loaded data as props).

## Required checks before done

- Run from repo root: `bun run typecheck`.
- Run both lint commands:
- `bun run lint` (all workspaces).
- `bun run lint:agent-rules` (web project rules only).
- If DB schema changed: run required `packages/database` generation/migration commands.
- Never declare completion while required checks fail.

## Package manager

- Bun. Use `bun install`, `bun run <script>`, `bun run --filter <pkg> <script>`, `bunx`. Never npm/pnpm/yarn.
- `bunfig.toml` pins `linker = "hoisted"` — turbo and Next.js resolve platform binaries from a hoisted tree.

## Keep costs low

- Reuse existing patterns in touched folders.
- Keep edits scoped to the task.
- Prefer enforceable rules in lint/CI/hooks over prompt text.

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

## Project docs

- Glossary at `CONTEXT.md`; ADRs in `docs/adr/`; system notes in `docs/systems/`.

## This fork

- Self-hosted only: no marketing pages, no transactional email, no tracking.
- Sign-up is invite-only. Accounts come from invitation links copied out of the UI (`/invite/[invitationId]`).
- Deployed via Coolify from prebuilt GHCR images; `docker-compose.yaml` is the source of truth for runtime env.
