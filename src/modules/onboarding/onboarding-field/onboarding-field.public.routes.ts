import { Router } from "express";

import { validateRequest } from "../../../middlewares/validation.middleware";
import { asyncHandler } from "../../../utils/async-handler";

import { getFieldsByCategorySlugController } from "./onboarding-field.controller";
import { categorySlugParamsSchema } from "./onboarding-field.validation";

const onboardingFieldPublicRouter = Router();

onboardingFieldPublicRouter.get(
  "/category/:slug",

  validateRequest(categorySlugParamsSchema),

  asyncHandler(getFieldsByCategorySlugController),
);

export { onboardingFieldPublicRouter };
