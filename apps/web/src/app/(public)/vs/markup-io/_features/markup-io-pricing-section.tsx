const rows = [
  {
    label: "Markup.io Pro",
    value: "$79/mo = $948/year",
  },
  {
    label: "Markup.io Enterprise (integrations)",
    value: "Custom — quote required",
  },
  {
    label: "FasterFixes Pro (up to 5)",
    value: "$20/mo = $240/year",
    highlight: true,
  },
  {
    label: "FasterFixes self-hosted",
    value: "$0",
    highlight: true,
  },
];

export function MarkupIoPricingSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Pricing
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Pricing that doesn&apos;t change on you
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Markup.io raised Pro from $29 to $79 in January 2025 and removed
            its free plan. Integrations now require Enterprise. FasterFixes
            includes GitHub, Linear, and Jira sync on the $20/mo plan, and the
            self-hosted version is free.
          </p>
        </div>

        <div className="bg-muted/30 mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 border-b p-5 last:border-b-0 ${
                row.highlight ? "bg-background" : ""
              }`}
            >
              <span className="text-sm font-medium md:text-base">
                {row.label}
              </span>
              <span className="text-foreground text-sm font-semibold tabular-nums md:text-base">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-sm">
          A 5-person agency saves $708/year switching from Markup.io Pro to
          FasterFixes Pro. Self-hosting saves the full $948.
        </p>
      </div>
    </section>
  );
}
