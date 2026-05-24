import { OnboardingFieldType } from "@prisma/client";
import slugify from "slugify";


import { AppError } from "../../../common/errors/app-error";

import {
  createOnboardingField,
  findCategoryById,
  findOnboardingFieldByKey,
  getFieldsByCategoryId,
  getFieldsByCategorySlug,
} from "./onboarding-field.repository";

interface CreateOnboardingFieldInput {
  categoryId: string;

  label: string;

  fieldType: OnboardingFieldType;

  placeholder?: string;

  helpText?: string;

  isRequired?: boolean;

  sortOrder: number;

  options?: string[];
}

const fieldTypesRequiringOptions = [
  OnboardingFieldType.SELECT,

  OnboardingFieldType.MULTI_SELECT,
];

export const createOnboardingFieldService = async (
  input: CreateOnboardingFieldInput,
) => {
  const category = await findCategoryById(input.categoryId);

  if (!category) {
    throw new AppError(
      "Onboarding category not found",
      404,
      "ONBOARDING_CATEGORY_NOT_FOUND",
    );
  }

  const generatedFieldKey = slugify(input.label, {
    lower: true,

    strict: true,

    replacement: "_",
  });

  const existingField = await findOnboardingFieldByKey(generatedFieldKey);

  if (existingField) {
    throw new AppError(
      "Field key already exists",
      409,
      "ONBOARDING_FIELD_ALREADY_EXISTS",
    );
  }

  const requiresOptions = fieldTypesRequiringOptions.includes(input.fieldType);

  if (requiresOptions && (!input.options || input.options.length === 0)) {
    throw new AppError(
      "Field options are required",
      400,
      "FIELD_OPTIONS_REQUIRED",
    );
  }

  return createOnboardingField({
    categoryId: input.categoryId,

    label: input.label.trim(),

    fieldKey: generatedFieldKey,

    fieldType: input.fieldType,

    placeholder: input.placeholder?.trim(),

    helpText: input.helpText?.trim(),

    isRequired: input.isRequired ?? false,

    sortOrder: input.sortOrder,

    options: input.options,
  });
};

export const getFieldsByCategoryIdService = async (categoryId: string) => {
  return getFieldsByCategoryId(categoryId);
};

export const getFieldsByCategorySlugService = async (slug: string) => {
  return getFieldsByCategorySlug(slug);
};
