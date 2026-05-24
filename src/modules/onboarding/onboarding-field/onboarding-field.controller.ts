import type { Request, Response } from "express";

import { sendSuccessResponse } from "../../../utils/api-response";

import {
  createOnboardingFieldService,
  getFieldsByCategoryIdService,
  getFieldsByCategorySlugService,
} from "./onboarding-field.service";

export const createOnboardingFieldController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const field = await createOnboardingFieldService(req.body);

  sendSuccessResponse(res, 201, "Onboarding field created successfully", field);
};

export const getFieldsByCategoryIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const fields = await getFieldsByCategoryIdService(req.params.categoryId);

  sendSuccessResponse(
    res,
    200,
    "Onboarding fields fetched successfully",
    fields,
  );
};

export const getFieldsByCategorySlugController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const fields = await getFieldsByCategorySlugService(req.params.slug);

  sendSuccessResponse(
    res,
    200,
    "Onboarding form schema fetched successfully",
    fields,
  );
};
