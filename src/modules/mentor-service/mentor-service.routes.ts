import { RoleType } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";

import { requireRoles } from "../../middlewares/role.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  createMentorServiceController,
  getOwnMentorServicesController,
  updateMentorServiceController,
  publishMentorServiceController,
  unpublishMentorServiceController,
  archiveMentorServiceController,
  deleteMentorServiceController,
} from "./mentor-service.controller";
import {
  createMentorServiceSchema,
  mentorServiceIdParamsSchema,
  updateMentorServiceSchema,
  mentorServiceQuerySchema,
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

  validateRequest(mentorServiceQuerySchema) as unknown as RequestHandler,

  asyncHandler(getOwnMentorServicesController),
);

mentorServiceRouter.post(
  "/:serviceId/publish",

  requireRoles([RoleType.MENTOR]),

  validateRequest(mentorServiceIdParamsSchema),

  asyncHandler(publishMentorServiceController),
);

mentorServiceRouter.post(
  "/:serviceId/unpublish",

  requireRoles([RoleType.MENTOR]),

  validateRequest(mentorServiceIdParamsSchema),

  asyncHandler(unpublishMentorServiceController),
);

mentorServiceRouter.post(
  "/:serviceId/archive",

  requireRoles([RoleType.MENTOR]),

  validateRequest(mentorServiceIdParamsSchema),

  asyncHandler(archiveMentorServiceController),
);

mentorServiceRouter.delete(
  "/:serviceId",

  requireRoles([RoleType.MENTOR]),

  validateRequest(mentorServiceIdParamsSchema),

  asyncHandler(deleteMentorServiceController),
);

export { mentorServiceRouter };
