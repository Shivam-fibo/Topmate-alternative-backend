import { Router } from "express";

import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import { getPublicMentorProfileController } from "./mentor-profile.controller";
import { mentorSlugParamsSchema } from "./mentor-profile.validation";

const mentorProfilePublicRouter = Router();

mentorProfilePublicRouter.get(
  "/:slug",

  validateRequest(mentorSlugParamsSchema),

  asyncHandler(getPublicMentorProfileController),
);

export { mentorProfilePublicRouter };
