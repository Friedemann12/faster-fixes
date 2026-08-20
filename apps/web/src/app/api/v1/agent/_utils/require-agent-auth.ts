import { type AgentScope, hasScope } from "@/server/api/check-agent-scope";
import { checkRateLimit } from "@/server/api/check-rate-limit";
import {
  type ResolvedAgentToken,
  resolveAgentToken,
} from "@/server/api/resolve-agent-token";
import { NextResponse } from "next/server";
import { agentError } from "./agent-error";

type AgentRateLimitKey = "agent:read" | "agent:write";

/**
 * Authenticates an agent request, checks scope, and applies rate limiting.
 * Returns the resolved token on success, or a `NextResponse` to short-circuit
 * the handler with the appropriate error.
 *
 * The rate limit is an abuse backstop, not authorization (see docs/adr/0007):
 * keyed per organization (not per token — minting tokens must not multiply the
 * budget), tiered by plan, and skipped entirely off cloud (self-hosted runs on
 * the operator's own infra).
 */
export async function requireAgentAuth(
  authHeader: string | null,
  scope: AgentScope,
  rateLimitKey: AgentRateLimitKey,
): Promise<ResolvedAgentToken | NextResponse> {
  const agentToken = await resolveAgentToken(authHeader);
  if (!agentToken) {
    return agentError("Unauthorized", "UNAUTHORIZED", 401);
  }

  if (!hasScope(agentToken.scopes, scope)) {
    return agentError("Insufficient permissions", "FORBIDDEN", 403);
  }

  {
    // Fixed ceiling instead of a per-plan one: this instance has no plans, but
    // the limit still works as an abuse backstop (see ADR 0007).
    const kind = rateLimitKey === "agent:write" ? "write" : "read";

    const result = await checkRateLimit(
      agentToken.organization.id,
      rateLimitKey,
    );

    if (!result.allowed) {
      const resetIso = new Date(result.resetAt).toISOString();
      return agentError(
        `Rate limit exceeded. 0 of ${result.limit} ${kind} operations remaining this hour. Retry after ${result.retryAfterSeconds} seconds (window resets at ${resetIso}).`,
        "RATE_LIMITED",
        429,
        {
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
          },
          extra: {
            limit: result.limit,
            remaining: result.remaining,
            retryAfterSeconds: result.retryAfterSeconds,
            resetAt: resetIso,
          },
        },
      );
    }
  }

  return agentToken;
}

export function isAuthFailure(
  result: ResolvedAgentToken | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
