import type { Request, Response } from "express";

import { AppError } from "../../common/errors/app-error";
import { sendSuccessResponse } from "../../utils/api-response";

import {
  createMentorProfileService,
  getOwnMentorProfileService,
  getPublicMentorProfileService,
  updateMentorProfileService,
} from "./mentor-profile.service";

type MentorSlugParams = {
  slug: string;
};

export const createMentorProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const profile = await createMentorProfileService({
    userId: req.user.userId,

    ...req.body,
  });

  sendSuccessResponse(res, 201, "Mentor profile created successfully", profile);
};

export const getOwnMentorProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const profile = await getOwnMentorProfileService(req.user.userId);

  sendSuccessResponse(res, 200, "Mentor profile fetched successfully", profile);
};

export const getPublicMentorProfileController = async (
  req: Request<MentorSlugParams>,
  res: Response,
): Promise<void> => {
  const profile = await getPublicMentorProfileService(req.params.slug);

  sendSuccessResponse(res, 200, "Mentor profile fetched successfully", profile);
};

export const updateMentorProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const profile = await updateMentorProfileService({
    userId: req.user.userId,

    ...req.body,
  });

  sendSuccessResponse(res, 200, "Mentor profile updated successfully", profile);
};
