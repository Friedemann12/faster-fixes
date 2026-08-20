"use client";

import { Button } from "@workspace/ui/components/button";
import { GithubIcon } from "@workspace/ui/components/icons/github-icon";

declare global {
  interface Window {
    __GITHUB_APP_NAME__?: string;
  }
}

export function GitHubNotConnected() {
  // Injected by the root layout rather than inlined at build time, so the same
  // image works for any instance and any GitHub App.
  const appName =
    typeof window === "undefined" ? "" : (window.__GITHUB_APP_NAME__ ?? "");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        No GitHub account connected. Install the Faster Fixes GitHub App to
        enable automatic issue creation from feedback.
      </p>
      {appName ? (
        <Button asChild>
          <a
            href={`https://github.com/apps/${appName}/installations/new`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="size-4" />
            Connect to GitHub
          </a>
        </Button>
      ) : (
        <p className="text-muted-foreground text-sm">
          Set GITHUB_APP_NAME to your GitHub App&apos;s slug to enable the
          install link.
        </p>
      )}
    </div>
  );
}
