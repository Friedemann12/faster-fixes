import z from "zod";

export const HardDeleteFeedbackSchema = z.object({
  feedbackId: z.string(),
});

export type HardDeleteFeedbackInput = z.infer<typeof HardDeleteFeedbackSchema>;
