import { MentorProfileStatus, MentorServiceStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

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

export interface FindMentorServicesOptions {
  page: number;

  limit: number;

  search?: string;

  status?: MentorServiceStatus;

  categoryId?: string;

  sort:
    | "updated_desc"
    | "updated_asc"
    | "price_desc"
    | "price_asc"
    | "title_asc"
    | "title_desc"
    | "sortOrder_asc"
    | "sortOrder_desc";
}

export const findMentorServicesByMentor = async (
  mentorProfileId: string,
  options: FindMentorServicesOptions,
) => {
  const { page, limit, search, status, categoryId, sort } = options;
  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.MentorServiceWhereInput = {
    mentorProfileId,
  };

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
      {
        shortDescription: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
    ];
  }

  let orderBy: Prisma.MentorServiceOrderByWithRelationInput = {
    sortOrder: "asc",
  };

  switch (sort) {
    case "updated_desc":
      orderBy = { updatedAt: "desc" };
      break;
    case "updated_asc":
      orderBy = { updatedAt: "asc" };
      break;
    case "price_desc":
      orderBy = { priceInPaise: "desc" };
      break;
    case "price_asc":
      orderBy = { priceInPaise: "asc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "title_desc":
      orderBy = { title: "desc" };
      break;
    case "sortOrder_asc":
      orderBy = { sortOrder: "asc" };
      break;
    case "sortOrder_desc":
      orderBy = { sortOrder: "desc" };
      break;
  }

  const [items, totalItems] = await prisma.$transaction([
    prisma.mentorService.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prisma.mentorService.count({
      where,
    }),
  ]);

  return { items, totalItems };
};

export const findPublicMentorServiceBySlug = (slug: string) => {
  return prisma.mentorService.findFirst({
    where: {
      slug,

      status: MentorServiceStatus.PUBLISHED,

      mentorProfile: {
        status: MentorProfileStatus.PUBLIC,
        approvalStatus: "APPROVED",
      },
    },

    include: {
      mentorProfile: true,

      category: true,
    },
  });
};

export interface FindPublicMentorServicesOptions {
  page: number;

  limit: number;

  search?: string;

  categoryId?: string;

  sort:
    | "updated_desc"
    | "updated_asc"
    | "price_desc"
    | "price_asc"
    | "title_asc"
    | "title_desc";
}

export const findPublicMentorServices = async (
  options: FindPublicMentorServicesOptions,
) => {
  const { page, limit, search, categoryId, sort } = options;
  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.MentorServiceWhereInput = {
    status: MentorServiceStatus.PUBLISHED,
    mentorProfile: {
      status: MentorProfileStatus.PUBLIC,
      approvalStatus: "APPROVED",
    },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
      {
        shortDescription: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
    ];
  }

  let orderBy: Prisma.MentorServiceOrderByWithRelationInput = {
    updatedAt: "desc",
  };

  switch (sort) {
    case "updated_desc":
      orderBy = { updatedAt: "desc" };
      break;
    case "updated_asc":
      orderBy = { updatedAt: "asc" };
      break;
    case "price_desc":
      orderBy = { priceInPaise: "desc" };
      break;
    case "price_asc":
      orderBy = { priceInPaise: "asc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "title_desc":
      orderBy = { title: "desc" };
      break;
  }

  const [items, totalItems] = await prisma.$transaction([
    prisma.mentorService.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true,
        mentorProfile: true,
      },
    }),
    prisma.mentorService.count({
      where,
    }),
  ]);

  return { items, totalItems };
};

export const deleteMentorService = (id: string) => {
  return prisma.mentorService.delete({
    where: {
      id,
    },
  });
};
