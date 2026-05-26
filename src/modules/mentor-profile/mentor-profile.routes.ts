import { RoleType } from "@prisma/client";
import { Router } from "express";


import { requireRoles } from "../../middlewares/role.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  createMentorProfileController,
  getOwnMentorProfileController,
  getPublicMentorProfileController,
} from "./mentor-profile.controller";
import { createMentorProfileSchema } from "./mentor-profile.validation";

const mentorProfileRouter = Router();

mentorProfileRouter.post(
  "/",

  requireRoles([RoleType.MENTOR]),

  validateRequest(createMentorProfileSchema),

  asyncHandler(createMentorProfileController),
);

mentorProfileRouter.get(
  "/me",

  requireRoles([RoleType.MENTOR]),

  asyncHandler(getOwnMentorProfileController),
);

mentorProfileRouter.get(
  "/:slug",

  asyncHandler(getPublicMentorProfileController),
);

export { mentorProfileRouter };
