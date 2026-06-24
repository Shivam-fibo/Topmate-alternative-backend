import type { Prisma } from "@prisma/client";

import { prisma } from "../../../database/prisma";

interface CreateSubmissionInput {
  userId: string;

  categoryId: string;

  answers: {
    fieldId: string;

    value: Prisma.InputJsonValue;
  }[];
}

export const findCategoryWithFields = (categoryId: string) => {
  return prisma.onboardingCategory.findUnique({
    where: {
      id: categoryId,
    },

    include: {
      fields: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const createSubmission = async (input: CreateSubmissionInput) => {
  return prisma.onboardingSubmission.create({
    data: {
      userId: input.userId,

      categoryId: input.categoryId,

      answers: {
        create: input.answers,
      },
    },

    include: {
      answers: true,
    },
  });
};

export const findPendingSubmissionByUserId = (userId: string) => {
  return prisma.onboardingSubmission.findFirst({
    where: {
      userId,

      status: "PENDING",
    },
  });
};

export const findOnboardingSubmissions = (
  status?: "PENDING" | "APPROVED" | "REJECTED",
) => {
  return prisma.onboardingSubmission.findMany({
    where: status
      ? {
          status,
        }
      : undefined,

    include: {
      user: {
        select: {
          id: true,

          email: true,
        },
      },

      category: true,

      answers: {
        include: {
          field: true,
        },

        orderBy: {
          field: {
            sortOrder: "asc",
          },
        },
      },
    },

    orderBy: {
      submittedAt: "desc",
    },
  });
};

export const findSubmissionById = (submissionId: string) => {
  return prisma.onboardingSubmission.findUnique({
    where: {
      id: submissionId,
    },

    include: {
      user: true,
    },
  });
};

export const updateSubmissionReview = (
  submissionId: string,

  status: "APPROVED" | "REJECTED",

  reviewNotes?: string,
) => {
  return prisma.onboardingSubmission.update({
    where: {
      id: submissionId,
    },

    data: {
      status,

      reviewNotes,

      reviewedAt: new Date(),
    },

    include: {
      user: {
        select: {
          id: true,

          email: true,
        },
      },

      category: true,

      answers: {
        include: {
          field: true,
        },

        orderBy: {
          field: {
            sortOrder: "asc",
          },
        },
      },
    },
  });
};

export const addMentorRoleToUser = async (userId: string) => {
  const mentorRole = await prisma.role.findUnique({
    where: {
      name: "MENTOR",
    },
  });

  if (!mentorRole) {
    throw new Error("MENTOR role not found");
  }

  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId,

      roleId: mentorRole.id,
    },
  });

  if (existingUserRole) {
    return;
  }

  return prisma.userRole.create({
    data: {
      userId,

      roleId: mentorRole.id,
    },
  });
};

export const createInitialMentorProfile = async (
  userId: string,
  slug: string,
) => {
  return prisma.mentorProfile.create({
    data: {
      userId,
      slug,
      status: "PRIVATE",
      onboardingStatus: "COMPLETED",
      approvalStatus: "APPROVED",
      schedulingConnectionStatus: "NOT_CONNECTED",
      approvedAt: new Date(),
    },
  });
};

export const findMentorProfileBySlug = async (slug: string) => {
  return prisma.mentorProfile.findUnique({
    where: {
      slug,
    },
  });
};
