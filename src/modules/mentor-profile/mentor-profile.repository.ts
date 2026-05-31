import type { Prisma } from "@prisma/client";
import { MentorProfileStatus } from "@prisma/client";

import { prisma } from "../../database/prisma";

export const findMentorProfileByUserId = (userId: string) => {
  return prisma.mentorProfile.findUnique({
    where: {
      userId,
    },
  });
};

export const findMentorProfileBySlug = (slug: string) => {
  return prisma.mentorProfile.findUnique({
    where: {
      slug,
    },
  });
};

export const findPublicMentorProfileBySlug = (slug: string) => {
  return prisma.mentorProfile.findFirst({
    where: {
      slug,

      status: MentorProfileStatus.PUBLIC,
    },
  });
};

export const updateMentorProfile = (
  userId: string,

  data: Prisma.MentorProfileUpdateInput,
) => {
  return prisma.mentorProfile.update({
    where: {
      userId,
    },

    data,
  });
};
