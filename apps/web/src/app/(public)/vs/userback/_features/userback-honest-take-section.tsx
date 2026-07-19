const userbackWins = [
  "You need annotated video feedback or session replay.",
  "You run NPS, CSAT, or in-app microsurveys.",
  "You want a public feature request portal with voting.",
  "Your stack is not React-based and you need framework-agnostic capture.",
  "You need SOC 2 Type II compliance or SSO available today.",
  "You want a mature integration roster (ClickUp 2-way sync, Zapier).",
];

export function UserbackHonestTakeSection() {
  return (
    <section className="bg-muted/30 w-full border-y py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Honest take
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Userback is the better choice for some teams
          </h2>
        </div>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-left text-lg">
          FasterFixes is narrower by design. If any of the points below
          describe your workflow, Userback is the more complete fit today.
        </p>

        <ul className="text-muted-foreground mx-auto mt-8 max-w-2xl list-disc space-y-2 pl-6 text-lg leading-relaxed">
          {userbackWins.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
