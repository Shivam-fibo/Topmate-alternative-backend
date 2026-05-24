import { z } from "zod";

export const createOnboardingSubmissionSchema = {
  body: z.object({
    categoryId: z.string().cuid(),

    answers: z
      .array(
        z.object({
          fieldId: z.string().cuid(),

          value: z.unknown(),
        }),
      )
      .min(1),
  }),
};

export const reviewSubmissionSchema = {
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),

    reviewNotes: z.string().trim().max(1000).optional(),
  }),
};
