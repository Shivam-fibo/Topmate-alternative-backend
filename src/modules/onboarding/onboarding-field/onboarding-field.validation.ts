import { OnboardingFieldType } from "@prisma/client";
import { z } from "zod";

export const createOnboardingFieldSchema = {
  body: z.object({
    categoryId: z.string().cuid(),

    label: z.string().trim().min(2).max(100),

    fieldType: z.nativeEnum(OnboardingFieldType),

    placeholder: z.string().trim().max(200).optional(),

    helpText: z.string().trim().max(500).optional(),

    isRequired: z.boolean().optional(),

    sortOrder: z.number().int().min(0),

    options: z.array(z.string().trim().min(1)).optional(),
  }),
};
