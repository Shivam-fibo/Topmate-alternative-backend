import { Router } from "express";

import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  getPublicMentorProfileController,
  updateMentorProfileController,
} from "./mentor-profile.controller";
import {
  mentorSlugParamsSchema,
  updateMentorProfileSchema,
} from "./mentor-profile.validation";

const mentorProfilePublicRouter = Router();

mentorProfilePublicRouter.get(
  "/:slug",

  validateRequest(mentorSlugParamsSchema),

  asyncHandler(getPublicMentorProfileController),
);

mentorProfilePublicRouter.put(
  "/:slug",

  validateRequest(updateMentorProfileSchema),

  asyncHandler(updateMentorProfileController),
);

export { mentorProfilePublicRouter };
