import { Router } from "express";
import type { RequestHandler } from "express";

import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  getPublicMentorServiceController,
  getPublicMentorServicesController,
} from "./mentor-service.controller";
import {
  mentorServiceSlugParamsSchema,
  publicMentorServiceQuerySchema,
} from "./mentor-service.validation";

const mentorServicePublicRouter = Router();

mentorServicePublicRouter.get(
  "/",

  validateRequest(publicMentorServiceQuerySchema) as unknown as RequestHandler,

  asyncHandler(getPublicMentorServicesController),
);

mentorServicePublicRouter.get(
  "/:slug",

  validateRequest(mentorServiceSlugParamsSchema),

  asyncHandler(getPublicMentorServiceController),
);

export { mentorServicePublicRouter };
