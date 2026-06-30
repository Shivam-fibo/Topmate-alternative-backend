import { prisma } from "../../../database/prisma";

interface CreateOnboardingCategoryParams {
  name: string;

  slug: string;

  description?: string;
}

export const createOnboardingCategory = (
  data: CreateOnboardingCategoryParams,
) => {
  return prisma.onboardingCategory.create({
    data,
  });
};

export const findOnboardingCategoryByName = (name: string) => {
  return prisma.onboardingCategory.findFirst({
    where: {
      name: {
        equals: name,

        mode: "insensitive",
      },
    },
  });
};

export const findOnboardingCategoryBySlug = (slug: string) => {
  return prisma.onboardingCategory.findUnique({
    where: {
      slug,
    },
  });
};

export const findOnboardingCategoryById = (id: string) => {
  return prisma.onboardingCategory.findUnique({
    where: {
      id,
    },
  });
};

export const getAllOnboardingCategories = () => {
  return prisma.onboardingCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getActiveOnboardingCategories = () => {
  return prisma.onboardingCategory.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};
