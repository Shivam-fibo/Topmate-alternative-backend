import { RoleType } from "@prisma/client";
import { Router } from "express";

import { requireRoles } from "../../../middlewares/role.middleware";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { asyncHandler } from "../../../utils/async-handler";

import {
  createOnboardingCategoryController,
  getAllOnboardingCategoriesController,
} from "./onboarding-category.controller";
import { createOnboardingCategorySchema } from "./onboarding-category.validation";

const onboardingCategoryRouter = Router();

onboardingCategoryRouter.post(
  "/",

  requireRoles([RoleType.ADMIN]),

  validateRequest(createOnboardingCategorySchema),

  asyncHandler(createOnboardingCategoryController),
);

onboardingCategoryRouter.get(
  "/",

  requireRoles([RoleType.ADMIN]),

  asyncHandler(getAllOnboardingCategoriesController),
);

export { onboardingCategoryRouter };
