import type {
  MentorSessionType,
  Prisma} from "@prisma/client";
import {
  MentorProfileStatus,
  MentorServiceStatus
} from "@prisma/client";

import { AppError } from "../../common/errors/app-error";
import { findMentorProfileByUserId } from "../mentor-profile/mentor-profile.repository";

import {
  createMentorService,
  findMentorServiceById,
  findMentorServiceBySlug,
  findMentorServicesByMentor,
  findPublicMentorServiceBySlug,
  updateMentorService,
} from "./mentor-service.repository";
import { generateMentorServiceSlug } from "./mentor-service.utils";

interface CreateMentorServiceInput {
  userId: string;

  categoryId: string;

  title: string;

  slug: string;

  shortDescription?: string;

  description: string;

  priceInPaise: number;

  durationInMinutes: number;

  sessionType: MentorSessionType;

  thumbnailUrl?: string;

  bannerUrl?: string;

  tags?: string[];

  status?: MentorServiceStatus;

  sortOrder?: number;
}

interface UpdateMentorServiceInput {
  userId: string;

  serviceId: string;

  categoryId?: string;

  title?: string;

  slug?: string;

  shortDescription?: string;

  description?: string;

  priceInPaise?: number;

  durationInMinutes?: number;

  sessionType?: MentorSessionType;

  thumbnailUrl?: string;

  bannerUrl?: string;

  tags?: string[];

  status?: MentorServiceStatus;

  sortOrder?: number;
}

export const createMentorServiceService = async (
  input: CreateMentorServiceInput,
) => {
  const mentorProfile = await findMentorProfileByUserId(input.userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (mentorProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentors cannot create services",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  const normalizedSlug = generateMentorServiceSlug(input.slug);

  const existingSlug = await findMentorServiceBySlug(normalizedSlug);

  if (existingSlug) {
    throw new AppError(
      "Service slug already exists",
      409,
      "SERVICE_SLUG_ALREADY_EXISTS",
    );
  }

  return createMentorService({
    title: input.title,

    slug: normalizedSlug,

    shortDescription: input.shortDescription,

    description: input.description,

    priceInPaise: input.priceInPaise,

    durationInMinutes: input.durationInMinutes,

    sessionType: input.sessionType,

    thumbnailUrl: input.thumbnailUrl,

    bannerUrl: input.bannerUrl,

    tags: input.tags as Prisma.InputJsonValue,

    status: input.status ?? MentorServiceStatus.DRAFT,

    sortOrder: input.sortOrder ?? 0,

    mentorProfile: {
      connect: {
        id: mentorProfile.id,
      },
    },

    category: {
      connect: {
        id: input.categoryId,
      },
    },
  });
};

export const updateMentorServiceService = async (
  input: UpdateMentorServiceInput,
) => {
  const mentorProfile = await findMentorProfileByUserId(input.userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (mentorProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentors cannot update services",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  const existingService = await findMentorServiceById(input.serviceId);

  if (!existingService) {
    throw new AppError(
      "Mentor service not found",
      404,
      "MENTOR_SERVICE_NOT_FOUND",
    );
  }

  if (existingService.mentorProfileId !== mentorProfile.id) {
    throw new AppError(
      "You do not own this service",
      403,
      "MENTOR_SERVICE_FORBIDDEN",
    );
  }

  let normalizedSlug: string | undefined;

  if (input.slug) {
    normalizedSlug = generateMentorServiceSlug(input.slug);

    const slugOwner = await findMentorServiceBySlug(normalizedSlug);

    if (slugOwner && slugOwner.id !== existingService.id) {
      throw new AppError(
        "Service slug already exists",
        409,
        "SERVICE_SLUG_ALREADY_EXISTS",
      );
    }
  }

  return updateMentorService(input.serviceId, {
    category: input.categoryId
      ? {
          connect: {
            id: input.categoryId,
          },
        }
      : undefined,

    title: input.title,

    slug: normalizedSlug,

    shortDescription: input.shortDescription,

    description: input.description,

    priceInPaise: input.priceInPaise,

    durationInMinutes: input.durationInMinutes,

    sessionType: input.sessionType,

    thumbnailUrl: input.thumbnailUrl,

    bannerUrl: input.bannerUrl,

    tags: input.tags as Prisma.InputJsonValue,

    status: input.status,

    sortOrder: input.sortOrder,
  });
};

export const getOwnMentorServicesService = async (userId: string) => {
  const mentorProfile = await findMentorProfileByUserId(userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  return findMentorServicesByMentor(mentorProfile.id);
};

export const getPublicMentorServiceService = async (slug: string) => {
  const service = await findPublicMentorServiceBySlug(slug);

  if (!service) {
    throw new AppError(
      "Mentor service not found",
      404,
      "MENTOR_SERVICE_NOT_FOUND",
    );
  }

  return service;
};
