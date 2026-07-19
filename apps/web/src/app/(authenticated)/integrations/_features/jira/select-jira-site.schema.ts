import { z } from "zod";

export const SelectJiraSiteSchema = z.object({
  cloudId: z.string().min(1, "Select a site"),
});

export type SelectJiraSiteSchemaType = z.infer<typeof SelectJiraSiteSchema>;
