import type { OnboardingFieldType, Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";

interface CreateOnboardingFieldParams {
  categoryId: string;

  label: string;

  fieldKey: string;

  fieldType: OnboardingFieldType;

  placeholder?: string;

  helpText?: string;

  isRequired?: boolean;

  sortOrder: number;

  options?: Prisma.InputJsonValue;
}

export const createOnboardingField = (data: CreateOnboardingFieldParams) => {
  return prisma.onboardingField.create({
    data,
  });
};

export const findOnboardingFieldByKey = (fieldKey: string) => {
  return prisma.onboardingField.findUnique({
    where: {
      fieldKey,
    },
  });
};

export const findCategoryById = (categoryId: string) => {
  return prisma.onboardingCategory.findUnique({
    where: {
      id: categoryId,
    },
  });
};

export const getFieldsByCategoryId = (categoryId: string) => {
  return prisma.onboardingField.findMany({
    where: {
      categoryId,

      isActive: true,
    },

    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const getFieldsByCategorySlug = (slug: string) => {
  return prisma.onboardingField.findMany({
    where: {
      isActive: true,

      category: {
        slug,

        isActive: true,
      },
    },

    orderBy: {
      sortOrder: "asc",
    },
  });
};
