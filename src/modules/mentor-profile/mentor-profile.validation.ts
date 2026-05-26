import { MentorProfileStatus } from "@prisma/client";
import { z } from "zod";

const socialLinksSchema = z.object({
  linkedin: z.string().url().optional(),

  twitter: z.string().url().optional(),

  youtube: z.string().url().optional(),

  website: z.string().url().optional(),
});

export const createMentorProfileSchema = {
  body: z.object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-z0-9-]+$/),

    headline: z.string().trim().min(5).max(120),

    bio: z.string().trim().min(20).max(2000),

    profileImageUrl: z.string().url().optional(),

    expertiseTags: z.array(z.string().trim().min(1)).max(20).optional(),

    socialLinks: socialLinksSchema.optional(),

    status: z.nativeEnum(MentorProfileStatus).optional(),
  }),
};

export const updateMentorProfileSchema = {
  body: createMentorProfileSchema.body.partial(),
};

export const mentorSlugParamsSchema = {
  params: z.object({
    slug: z.string().trim().min(3).max(50),
  }),
};
