import type { Prisma } from "@prisma/client";
import { MentorServiceStatus } from "@prisma/client";

import { prisma } from "../../database/prisma";

export const findMentorServiceBySlug = (slug: string) => {
  return prisma.mentorService.findUnique({
    where: {
      slug,
    },
  });
};

export const createMentorService = (data: Prisma.MentorServiceCreateInput) => {
  return prisma.mentorService.create({
    data,
  });
};

export const updateMentorService = (
  id: string,

  data: Prisma.MentorServiceUpdateInput,
) => {
  return prisma.mentorService.update({
    where: {
      id,
    },

    data,
  });
};

export const findMentorServiceById = (id: string) => {
  return prisma.mentorService.findUnique({
    where: {
      id,
    },

    include: {
      category: true,
    },
  });
};

export const findMentorServicesByMentor = (mentorProfileId: string) => {
  return prisma.mentorService.findMany({
    where: {
      mentorProfileId,
    },

    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const findPublicMentorServiceBySlug = (slug: string) => {
  return prisma.mentorService.findFirst({
    where: {
      slug,

      status: MentorServiceStatus.PUBLISHED,

      mentorProfile: {
        status: "PUBLIC",
      },
    },

    include: {
      mentorProfile: true,

      category: true,
    },
  });
};
