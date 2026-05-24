import slugify from "slugify";

import { AppError } from "../../../common/errors/app-error";

import {
  createOnboardingCategory,
  findOnboardingCategoryByName,
  findOnboardingCategoryBySlug,
  getActiveOnboardingCategories,
  getAllOnboardingCategories,
} from "./onboarding-category.repository";

interface CreateOnboardingCategoryInput {
  name: string;

  description?: string;
}

export const createOnboardingCategoryService = async (
  input: CreateOnboardingCategoryInput,
) => {
  const normalizedName = input.name.trim();

  const existingCategory = await findOnboardingCategoryByName(normalizedName);

  if (existingCategory) {
    throw new AppError(
      "Onboarding category already exists",
      409,
      "ONBOARDING_CATEGORY_ALREADY_EXISTS",
    );
  }

  const generatedSlug = slugify(normalizedName, {
    lower: true,

    strict: true,

    trim: true,
  });

  const existingSlug = await findOnboardingCategoryBySlug(generatedSlug);

  if (existingSlug) {
    throw new AppError(
      "Generated slug already exists",
      409,
      "ONBOARDING_CATEGORY_SLUG_ALREADY_EXISTS",
    );
  }

  return createOnboardingCategory({
    name: normalizedName,

    slug: generatedSlug,

    description: input.description?.trim(),
  });
};

export const getAllOnboardingCategoriesService = async () => {
  return getAllOnboardingCategories();
};

export const getActiveOnboardingCategoriesService = async () => {
  return getActiveOnboardingCategories();
};
