import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export const jiraSetupSteps = [
  {
    label: "Connect your Jira site",
    body: "Authorize once via OAuth at the organization level. Tokens are encrypted at rest.",
  },
  {
    label: "Link a project, pick an issue type",
    body: "Select a Jira project and issue type, set a default label, and toggle auto-create. Required fields are checked as you link, so nothing fails later mid-triage.",
  },
  {
    label: "Feedback flows in, issues appear",
    body: "Each new feedback opens a Jira issue with full context, and status stays in sync both ways.",
  },
];

export function JiraHowItWorksSection() {
  return (
    <section className="bg-muted/30 w-full border-y py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Setup
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Connected in three steps
          </h2>
        </div>

        <ol className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {jiraSetupSteps.map((step, i) => (
            <li
              key={step.label}
              className="bg-background flex gap-4 rounded-xl border p-6"
            >
              <span className="text-muted-foreground font-mono text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold">{step.label}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href={"/docs/integrations/jira" as Route}>
              Full setup guide
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
