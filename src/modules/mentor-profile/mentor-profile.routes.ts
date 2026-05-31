import { RoleType } from "@prisma/client";
import { Router } from "express";

import { requireRoles } from "../../middlewares/role.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  getOwnMentorProfileController,
  updateMentorProfileController,
} from "./mentor-profile.controller";
import { updateMentorProfileSchema } from "./mentor-profile.validation";

const mentorProfileRouter = Router();

mentorProfileRouter.patch(
  "/",

  requireRoles([RoleType.MENTOR]),

  validateRequest(updateMentorProfileSchema),

  asyncHandler(updateMentorProfileController),
);

mentorProfileRouter.get(
  "/me",

  requireRoles([RoleType.MENTOR]),

  asyncHandler(getOwnMentorProfileController),
);

export { mentorProfileRouter };
