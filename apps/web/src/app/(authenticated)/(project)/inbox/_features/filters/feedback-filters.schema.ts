import { inferParserType, parseAsString } from "nuqs";

export const feedbackFiltersParsersSchema = {
  pageUrl: parseAsString,
  sort: parseAsString.withDefault("newest"),
  feedbackId: parseAsString,
};

export type FeedbackFiltersInput = inferParserType<
  typeof feedbackFiltersParsersSchema
>;
