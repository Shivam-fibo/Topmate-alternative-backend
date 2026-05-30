import { MentorServiceStatus, MentorSessionType } from "@prisma/client";
import { z } from "zod";

export const createMentorServiceSchema = {
  body: z.object({
    categoryId: z.string().cuid(),

    title: z.string().trim().min(5).max(120),

    slug: z
      .string()
      .trim()
      .min(3)
      .max(100)
      .regex(/^[a-z0-9-]+$/),

    shortDescription: z.string().trim().max(300).optional(),

    description: z.string().trim().min(20).max(5000),

    priceInPaise: z.number().int().min(0),

    durationInMinutes: z.number().int().min(5).max(1440),

    sessionType: z.nativeEnum(MentorSessionType),

    thumbnailUrl: z.string().url().optional(),

    bannerUrl: z.string().url().optional(),

    tags: z.array(z.string()).max(20).optional(),

    status: z.nativeEnum(MentorServiceStatus).optional(),

    sortOrder: z.number().int().min(0).optional(),
  }),
};

export const updateMentorServiceSchema = {
  body: createMentorServiceSchema.body.partial(),
};

export const mentorServiceIdParamsSchema = {
  params: z.object({
    serviceId: z.string().cuid(),
  }),
};

export const mentorServiceSlugParamsSchema = {
  params: z.object({
    slug: z.string().trim().min(3),
  }),
};

export const mentorServiceQuerySchema = {
  query: z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(50).default(10),

    status: z.nativeEnum(MentorServiceStatus).optional(),

    categoryId: z.string().cuid().optional(),
  }),
};
