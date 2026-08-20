import { checkRateLimit } from "@/server/api/check-rate-limit";
import { resolveProject } from "@/server/api/resolve-project";
import { validateOrigin } from "@/server/api/validate-origin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const project = await resolveProject(req.headers.get("x-api-key"));
  if (!project) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!validateOrigin(req.headers, project.domain)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  const { allowed } = await checkRateLimit(project.id, "read");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  const config = project.widgetConfig;

  return NextResponse.json({
    enabled: config?.enabled ?? true,
    // Self-hosted instances have no plans, so the widget never shows branding.
    branding: false,
  });
}
