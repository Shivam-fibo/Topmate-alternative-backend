import { Router } from "express";

import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import { getPublicMentorServiceController } from "./mentor-service.controller";
import { mentorServiceSlugParamsSchema } from "./mentor-service.validation";

const mentorServicePublicRouter = Router();

mentorServicePublicRouter.get(
  "/:slug",

  validateRequest(mentorServiceSlugParamsSchema),

  asyncHandler(getPublicMentorServiceController),
);

export { mentorServicePublicRouter };
