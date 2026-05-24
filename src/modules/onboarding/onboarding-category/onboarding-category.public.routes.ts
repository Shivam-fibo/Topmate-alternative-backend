import { Router } from "express";

import { asyncHandler } from "../../../utils/async-handler";

import { getActiveOnboardingCategoriesController } from "./onboarding-category.controller";

const onboardingCategoryPublicRouter = Router();

onboardingCategoryPublicRouter.get(
  "/",

  asyncHandler(getActiveOnboardingCategoriesController),
);

export { onboardingCategoryPublicRouter };
