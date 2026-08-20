import { z } from "zod";

export const UpdateProjectLinkSchema = z.object({
  projectId: z.string(),
  autoCreateIssues: z.boolean().optional(),
  defaultLabels: z.array(z.string()).optional(),
});

export type UpdateProjectLinkInput = z.infer<
  typeof UpdateProjectLinkSchema
>;
