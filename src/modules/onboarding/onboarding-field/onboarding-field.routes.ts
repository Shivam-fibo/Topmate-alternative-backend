import { RoleType } from "@prisma/client";
import { Router } from "express";


import { requireRoles } from "../../../middlewares/role.middleware";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { asyncHandler } from "../../../utils/async-handler";

import {
  createOnboardingFieldController,
  getFieldsByCategoryIdController,
} from "./onboarding-field.controller";
import {
  categoryIdParamsSchema,
  createOnboardingFieldSchema,
} from "./onboarding-field.validation";

const onboardingFieldRouter = Router();

onboardingFieldRouter.post(
  "/",

  requireRoles([RoleType.ADMIN]),

  validateRequest(createOnboardingFieldSchema),

  asyncHandler(createOnboardingFieldController),
);

onboardingFieldRouter.get(
  "/category/:categoryId",

  requireRoles([RoleType.ADMIN]),

  validateRequest(categoryIdParamsSchema),

  asyncHandler(getFieldsByCategoryIdController),
);

export { onboardingFieldRouter };
