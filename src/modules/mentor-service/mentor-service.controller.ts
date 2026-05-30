import type { Request, Response } from "express";

import { AppError } from "../../common/errors/app-error";
import { sendSuccessResponse } from "../../utils/api-response";

import {
  createMentorServiceService,
  getOwnMentorServicesService,
  getPublicMentorServiceService,
  updateMentorServiceService,
} from "./mentor-service.service";

type MentorServiceParams = {
  serviceId: string;
};

type MentorServiceSlugParams = {
  slug: string;
};

export const createMentorServiceController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const service = await createMentorServiceService({
    userId: req.user.userId,

    ...req.body,
  });

  sendSuccessResponse(res, 201, "Mentor service created successfully", service);
};

export const updateMentorServiceController = async (
  req: Request<MentorServiceParams>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const service = await updateMentorServiceService({
    userId: req.user.userId,

    serviceId: req.params.serviceId,

    ...req.body,
  });

  sendSuccessResponse(res, 200, "Mentor service updated successfully", service);
};

export const getOwnMentorServicesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const services = await getOwnMentorServicesService(req.user.userId);

  sendSuccessResponse(
    res,
    200,
    "Mentor services fetched successfully",
    services,
  );
};

export const getPublicMentorServiceController = async (
  req: Request<MentorServiceSlugParams>,
  res: Response,
): Promise<void> => {
  const service = await getPublicMentorServiceService(req.params.slug);

  sendSuccessResponse(res, 200, "Mentor service fetched successfully", service);
};
