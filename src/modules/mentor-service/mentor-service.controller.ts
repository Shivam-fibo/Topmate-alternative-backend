import type { Request, Response } from "express";

import { AppError } from "../../common/errors/app-error";
import { sendSuccessResponse } from "../../utils/api-response";

import type {
  FindMentorServicesOptions,
  FindPublicMentorServicesOptions,
} from "./mentor-service.repository";
import {
  createMentorServiceService,
  getOwnMentorServicesService,
  getPublicMentorServiceService,
  updateMentorServiceService,
  publishMentorServiceService,
  unpublishMentorServiceService,
  archiveMentorServiceService,
  getPublicMentorServicesService,
  deleteMentorServiceService,
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

  const query = req.query as unknown as FindMentorServicesOptions;

  const result = await getOwnMentorServicesService(req.user.userId, {
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status,
    categoryId: query.categoryId,
    sort: query.sort,
  });

  sendSuccessResponse(res, 200, "Mentor services fetched successfully", result);
};

export const getPublicMentorServiceController = async (
  req: Request<MentorServiceSlugParams>,
  res: Response,
): Promise<void> => {
  const service = await getPublicMentorServiceService(req.params.slug);

  sendSuccessResponse(res, 200, "Mentor service fetched successfully", service);
};

export const getPublicMentorServicesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as FindPublicMentorServicesOptions;

  const result = await getPublicMentorServicesService({
    page: query.page,
    limit: query.limit,
    search: query.search,
    categoryId: query.categoryId,
    sort: query.sort,
  });

  sendSuccessResponse(
    res,
    200,
    "Public mentor services fetched successfully",
    result,
  );
};

export const publishMentorServiceController = async (
  req: Request<MentorServiceParams>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const service = await publishMentorServiceService({
    userId: req.user.userId,
    serviceId: req.params.serviceId,
  });

  sendSuccessResponse(
    res,
    200,
    "Mentor service published successfully",
    service,
  );
};

export const unpublishMentorServiceController = async (
  req: Request<MentorServiceParams>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const service = await unpublishMentorServiceService({
    userId: req.user.userId,
    serviceId: req.params.serviceId,
  });

  sendSuccessResponse(
    res,
    200,
    "Mentor service unpublished successfully",
    service,
  );
};

export const archiveMentorServiceController = async (
  req: Request<MentorServiceParams>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const service = await archiveMentorServiceService({
    userId: req.user.userId,
    serviceId: req.params.serviceId,
  });

  sendSuccessResponse(
    res,
    200,
    "Mentor service archived successfully",
    service,
  );
};

export const deleteMentorServiceController = async (
  req: Request<MentorServiceParams>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  await deleteMentorServiceService({
    userId: req.user.userId,
    serviceId: req.params.serviceId,
  });

  sendSuccessResponse(res, 200, "Mentor service deleted successfully", null);
};
