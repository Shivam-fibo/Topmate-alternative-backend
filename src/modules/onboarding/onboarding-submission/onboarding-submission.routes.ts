import { RoleType } from "@prisma/client";
import { Router } from "express";

import { requireRoles } from "../../../middlewares/role.middleware";
import { validateRequest } from "../../../middlewares/validation.middleware";
import { asyncHandler } from "../../../utils/async-handler";

import {
  createOnboardingSubmissionController,
  reviewSubmissionController,
} from "./onboarding-submission.controller";
import {
  createOnboardingSubmissionSchema,
  reviewSubmissionSchema,
} from "./onboarding-submission.validation";

const onboardingSubmissionRouter = Router();

onboardingSubmissionRouter.post(
  "/",

  validateRequest(createOnboardingSubmissionSchema),

  asyncHandler(createOnboardingSubmissionController),
);

onboardingSubmissionRouter.patch(
  "/:submissionId/review",

  requireRoles([RoleType.ADMIN]),

  validateRequest(reviewSubmissionSchema),

  asyncHandler(reviewSubmissionController),
);

export { onboardingSubmissionRouter };
