import type { Request, Response } from "express";

import { AppError } from "../../../common/errors/app-error";
import { sendSuccessResponse } from "../../../utils/api-response";

import {
  createOnboardingSubmissionService,
  getOnboardingSubmissionsService,
  reviewSubmissionService,
} from "./onboarding-submission.service";

export const createOnboardingSubmissionController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const submission = await createOnboardingSubmissionService({
    userId: req.user.userId,

    ...req.body,
  });

  sendSuccessResponse(
    res,
    201,
    "Onboarding submitted successfully",
    submission,
  );
};

export const getOnboardingSubmissionsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const submissions = await getOnboardingSubmissionsService({
    status: req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
  });

  sendSuccessResponse(
    res,
    200,
    "Onboarding submissions fetched successfully",
    submissions,
  );
};

export const reviewSubmissionController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const submission = await reviewSubmissionService({
    submissionId: req.params.submissionId,

    ...req.body,
  });

  sendSuccessResponse(res, 200, "Submission reviewed successfully", submission);
};
