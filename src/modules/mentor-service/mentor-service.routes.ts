import { RoleType } from "@prisma/client";
import { Router } from "express";


import { requireRoles } from "../../middlewares/role.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  createMentorServiceController,
  getOwnMentorServicesController,
  updateMentorServiceController,
} from "./mentor-service.controller";
import {
  createMentorServiceSchema,
  mentorServiceIdParamsSchema,
  updateMentorServiceSchema,
} from "./mentor-service.validation";

const mentorServiceRouter = Router();

mentorServiceRouter.post(
  "/",

  requireRoles([RoleType.MENTOR]),

  validateRequest(createMentorServiceSchema),

  asyncHandler(createMentorServiceController),
);

mentorServiceRouter.patch(
  "/:serviceId",

  requireRoles([RoleType.MENTOR]),

  validateRequest({
    ...mentorServiceIdParamsSchema,

    ...updateMentorServiceSchema,
  }),

  asyncHandler(updateMentorServiceController),
);

mentorServiceRouter.get(
  "/me",

  requireRoles([RoleType.MENTOR]),

  asyncHandler(getOwnMentorServicesController),
);

export { mentorServiceRouter };
