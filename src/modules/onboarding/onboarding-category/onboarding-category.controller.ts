import type { Request, Response } from "express";

import { sendSuccessResponse } from "../../../utils/api-response";

import {
  createOnboardingCategoryService,
  getActiveOnboardingCategoriesService,
  getAllOnboardingCategoriesService,
} from "./onboarding-category.service";

export const createOnboardingCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const category = await createOnboardingCategoryService(req.body);

  sendSuccessResponse(
    res,
    201,
    "Onboarding category created successfully",
    category,
  );
};

export const getAllOnboardingCategoriesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await getAllOnboardingCategoriesService();

  sendSuccessResponse(
    res,
    200,
    "Onboarding categories fetched successfully",
    categories,
  );
};

export const getActiveOnboardingCategoriesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await getActiveOnboardingCategoriesService();

  sendSuccessResponse(
    res,
    200,
    "Active onboarding categories fetched successfully",
    categories,
  );
};
